import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;
const DB_PATH = "unilog.db";
const JWT_SECRET = process.env.JWT_SECRET || "unilog-default-secret";

// Initialize Database
const db = new Database(DB_PATH);
const schema = fs.readFileSync("schema.sql", "utf8");
db.exec(schema);

// Seed basic data (Blocks, Houses, Rooms) if empty
const seedData = () => {
  const result = db.prepare("SELECT count(*) as count FROM blocks").get() as { count: number };
  const blockCount = result?.count || 0;
  if (blockCount === 0) {
    console.log("Seeding initial data...");
    
    // Create Blocks
    const insertBlock = db.prepare("INSERT INTO blocks (name, gender) VALUES (?, ?)");
    const blockA = insertBlock.run("A", "male").lastInsertRowid;
    const blockB = insertBlock.run("B", "female").lastInsertRowid;

    const insertHouse = db.prepare("INSERT INTO houses (block_id, number) VALUES (?, ?)");
    const insertRoom = db.prepare("INSERT INTO rooms (house_id, number) VALUES (?, ?)");

    // Create 10 houses per block, 2 rooms per house
    [blockA, blockB].forEach((blockId, bIdx) => {
      for (let h = 1; h <= 10; h++) {
        const houseId = insertHouse.run(blockId, h).lastInsertRowid;
        for (let r = 1; r <= 2; r++) {
          insertRoom.run(houseId, r);
        }
      }
    });

    // Create a default admin user
    const hashedPW = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO users (full_name, role, email, password_hash, status) VALUES (?, ?, ?, ?, ?)")
      .run("Admin UniLog", "admin", "admin@unilog.com", hashedPW, "active");
      
    console.log("Seeding complete.");
  }
};
seedData();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// API Middleware for Auth
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

// Auth
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  const token = jwt.sign({ id: user.id, role: user.role, name: user.full_name }, JWT_SECRET, { expiresIn: '24h' });
  res.cookie('token', token, { httpOnly: true });
  res.json({ token, user: { id: user.id, role: user.role, name: user.full_name } });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Logged out" });
});

// Students
app.get("/api/students", authenticateToken, (req: any, res) => {
  const students = db.prepare("SELECT * FROM users WHERE role = 'student'").all();
  res.json(students);
});

app.post("/api/students", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Only admins can register students" });
  
  const { full_name, email, phone, course, year, location, password } = req.body;
  const hashedPW = bcrypt.hashSync(password || "student123", 10);
  
  try {
    const result = db.prepare(
      "INSERT INTO users (full_name, email, phone, course, year, location, role, password_hash) VALUES (?, ?, ?, ?, ?, ?, 'student', ?)"
    ).run(full_name, email, phone, course, year, location, hashedPW);
    res.json({ id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Occupancy Dashboard
app.get("/api/dashboard/occupancy", authenticateToken, (req: any, res) => {
  const query = `
    SELECT 
      b.name as block,
      h.number as house,
      r.number as room,
      r.id as room_id,
      r.capacity,
      COUNT(o.student_id) as current_occupants
    FROM rooms r
    JOIN houses h ON r.house_id = h.id
    JOIN blocks b ON h.block_id = b.id
    LEFT JOIN occupancy o ON r.id = o.room_id AND o.end_date IS NULL
    GROUP BY r.id
  `;
  const report = db.prepare(query).all();
  res.json(report);
});

// Rooms Details
app.get("/api/rooms", authenticateToken, (req: any, res) => {
  const rooms = db.prepare(`
    SELECT r.id, b.name as block, h.number as house, r.number as room, r.capacity,
           (SELECT COUNT(*) FROM occupancy o WHERE o.room_id = r.id AND o.end_date IS NULL) as occupants
    FROM rooms r
    JOIN houses h ON r.house_id = h.id
    JOIN blocks b ON h.block_id = b.id
  `).all();
  res.json(rooms);
});

app.post("/api/occupancy", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });
  const { student_id, room_id, start_date } = req.body;
  
  const room: any = db.prepare(`
    SELECT r.capacity, (SELECT COUNT(*) FROM occupancy o WHERE o.room_id = r.id AND o.end_date IS NULL) as current 
    FROM rooms r WHERE r.id = ?
  `).get(room_id);

  if (!room) return res.status(404).json({ message: "Room not found" });
  if (room.current >= room.capacity) {
    return res.status(400).json({ message: "Quarto atingiu a capacidade máxima" });
  }

  db.prepare("UPDATE occupancy SET end_date = ? WHERE student_id = ? AND end_date IS NULL").run(start_date, student_id);
  db.prepare("INSERT INTO occupancy (student_id, room_id, start_date) VALUES (?, ?, ?)").run(student_id, room_id, start_date);
  
  res.json({ message: "Atribuído com sucesso" });
});

// Payments
app.get("/api/payments", authenticateToken, (req: any, res) => {
  const { student_id } = req.query;
  let query = "SELECT p.*, u.full_name as student_name FROM payments p JOIN users u ON p.student_id = u.id";
  let params: any[] = [];
  
  if (student_id) {
    query += " WHERE p.student_id = ?";
    params.push(student_id);
  } else if (req.user.role === 'student') {
    query += " WHERE p.student_id = ?";
    params.push(req.user.id);
  }
  
  const payments = db.prepare(query + " ORDER BY p.payment_date DESC").all(...params);
  res.json(payments);
});

app.post("/api/payments", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });
  const { student_id, amount, payment_date, reference_month, method } = req.body;
  
  const result = db.prepare(
    "INSERT INTO payments (student_id, amount, payment_date, reference_month, method) VALUES (?, ?, ?, ?, ?)"
  ).run(student_id, amount, payment_date, reference_month, method);
  
  res.json({ id: result.lastInsertRowid });
});

// Messages
app.get("/api/messages", authenticateToken, (req: any, res) => {
  const messages = db.prepare(`
    SELECT m.*, u.full_name as sender_name 
    FROM messages m 
    JOIN users u ON m.sender_id = u.id 
    WHERE m.recipient_id = ? OR m.type = 'broadcast' OR m.sender_id = ?
    ORDER BY m.created_at ASC
  `).all(req.user.id, req.user.id);
  res.json(messages);
});

app.post("/api/messages", authenticateToken, (req: any, res) => {
  const { content, recipient_id, type } = req.body;
  const sender_id = req.user.id;
  
  db.prepare("INSERT INTO messages (sender_id, recipient_id, content, type) VALUES (?, ?, ?, ?)")
    .run(sender_id, recipient_id || null, content, type);
    
  res.json({ message: "Mensagem enviada" });
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
