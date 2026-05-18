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

// 1. Run basic schema first so tables exist
const schema = fs.readFileSync("schema.sql", "utf8");
try {
  db.exec(schema);
  console.log("Database schema initialized.");
} catch (e) {
  console.error("Critical error: Schema execution failed:", e);
}

// 2. Migration: Update roles check constraint if necessary
try {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  if (tableInfo.length > 0) {
    // Check if the current table supports the new roles by inspecting the SQL
    const userTableData = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get() as any;
    const currentSql = userTableData?.sql || "";
    
    if (!currentSql.includes("'registrar'") || !currentSql.includes("'finance'")) {
      console.log("Migrating users table for new roles (Registrar/Finance)...");
      try {
        db.exec("PRAGMA foreign_keys = OFF;");
        db.transaction(() => {
          // Backup data, drop old, create new, restore data
          db.exec(`
            CREATE TABLE users_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              full_name TEXT NOT NULL,
              role TEXT CHECK(role IN ('admin', 'student', 'registrar', 'finance')) NOT NULL,
              email TEXT UNIQUE NOT NULL,
              phone TEXT,
              password_hash TEXT NOT NULL,
              course TEXT,
              year INTEGER,
              location TEXT,
              status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            INSERT INTO users_new (id, full_name, role, email, phone, password_hash, course, year, location, status, created_at)
            SELECT id, full_name, role, email, phone, password_hash, course, year, location, status, created_at FROM users;
            DROP TABLE users;
            ALTER TABLE users_new RENAME TO users;
          `);
        })();
        db.exec("PRAGMA foreign_keys = ON;");
        console.log("Migration successful.");
      } catch (err) {
        console.error("Migration failed:", err);
      }
    }
  }
} catch (e) {
  console.log("Migration check failed:", e);
}

// Seed basic data (Blocks, Houses, Rooms) if empty
const seedData = () => {
  const blockCountResult = db.prepare("SELECT count(*) as count FROM blocks").get() as any;
  const blockCount = blockCountResult?.count || 0;
  
  if (blockCount === 0) {
    console.log("Seeding architectural data...");
    
    db.transaction(() => {
      // Create Blocks
      const insertBlock = db.prepare("INSERT INTO blocks (name, gender) VALUES (?, ?)");
      const blockA = insertBlock.run("A", "male").lastInsertRowid;
      const blockB = insertBlock.run("B", "female").lastInsertRowid;

      const insertHouse = db.prepare("INSERT INTO houses (block_id, number) VALUES (?, ?)");
      const insertRoom = db.prepare("INSERT INTO rooms (house_id, number) VALUES (?, ?)");

      // Create 10 houses per block, 2 rooms per house
      [blockA, blockB].forEach((blockId) => {
        for (let h = 1; h <= 10; h++) {
          const houseId = insertHouse.run(blockId, h).lastInsertRowid;
          for (let r = 1; r <= 2; r++) {
            insertRoom.run(houseId, r);
          }
        }
      });
    })();
  }

  // Ensure Admin and specialized accounts exist
  const admins = [
    { name: "Admin UniLog", role: "admin", email: "admin@unilog.com" },
    { name: "Registro Staff", role: "registrar", email: "registro@unilog.com" },
    { name: "Financeiro Staff", role: "finance", email: "financeiro@unilog.com" }
  ];

  const hashedPW = bcrypt.hashSync("admin123", 10);
  
  const checkUser = db.prepare("SELECT id FROM users WHERE email = ?");
  const insertUser = db.prepare(`
    INSERT INTO users (full_name, role, email, password_hash, status) 
    VALUES (?, ?, ?, ?, 'active')
  `);
  const updateUser = db.prepare(`
    UPDATE users SET role = ?, password_hash = ?, status = 'active' WHERE email = ?
  `);

  db.transaction(() => {
    admins.forEach(admin => {
      const existing: any = checkUser.get(admin.email);
      if (existing) {
        console.log(`Updating existing staff: ${admin.email}`);
        updateUser.run(admin.role, hashedPW, admin.email);
      } else {
        console.log(`Inserting new staff: ${admin.email}`);
        insertUser.run(admin.name, admin.role, admin.email, hashedPW);
      }
    });
  })();
  
  const currentStaff = db.prepare("SELECT email, role FROM users WHERE role IN ('admin', 'registrar', 'finance')").all();
  console.log("Seeded system accounts:", JSON.stringify(currentStaff));
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
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      console.log(`Invalid password for: ${email}`);
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.full_name }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    
    console.log(`Login success: ${email} (${user.role})`);
    res.json({ token, user: { id: user.id, role: user.role, name: user.full_name } });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Logged out" });
});

// Students
app.get("/api/students", authenticateToken, (req: any, res) => {
  const { status } = req.query;
  const roleFilter = "u.role = 'student'";
  
  let query = `
    SELECT 
      u.*,
      (b.name || h.number || '-Q' || r.number) as room_location
    FROM users u
    LEFT JOIN occupancy o ON u.id = o.student_id AND o.end_date IS NULL
    LEFT JOIN rooms r ON o.room_id = r.id
    LEFT JOIN houses h ON r.house_id = h.id
    LEFT JOIN blocks b ON h.block_id = b.id
    WHERE ${roleFilter}
  `;
  if (status) query += ` AND u.status = '${status}'`;
  const students = db.prepare(query).all();
  res.json(students);
});

// Managers Management (Admin only)
app.get("/api/managers", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Acesso restrito ao administrador mestre" });
  
  const managers = db.prepare("SELECT id, full_name, role, email, phone, status, created_at FROM users WHERE role IN ('registrar', 'finance')").all();
  res.json(managers);
});

app.post("/api/managers", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Acesso restrito ao administrador mestre" });
  
  const { full_name, email, phone, role, password } = req.body;
  if (!['registrar', 'finance'].includes(role)) {
    return res.status(400).json({ message: "Cargo inválido. Use 'registrar' ou 'finance'." });
  }
  
  const hashedPW = bcrypt.hashSync(password || "staff123", 10);

  try {
    const result = db.prepare(
      "INSERT INTO users (full_name, email, phone, role, password_hash) VALUES (?, ?, ?, ?, ?)"
    ).run(full_name, email, phone, role, hashedPW);
    res.json({ id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/managers/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Acesso restrito ao administrador mestre" });
  const { full_name, email, phone, role, status, password } = req.body;
  
  try {
    if (password) {
      const hashedPW = bcrypt.hashSync(password, 10);
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashedPW, req.params.id);
    }
    
    db.prepare(
      "UPDATE users SET full_name = ?, email = ?, phone = ?, role = ?, status = ? WHERE id = ?"
    ).run(full_name, email, phone, role, status || 'active', req.params.id);

    res.json({ message: "Gestor atualizado" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/managers/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Acesso restrito ao administrador mestre" });
  
  try {
    db.prepare("DELETE FROM users WHERE id = ? AND role IN ('registrar', 'finance')").run(req.params.id);
    res.json({ message: "Gestor removido" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/api/students", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'registrar') return res.status(403).json({ message: "Apenas registrados ou admin" });
  
  const { full_name, email, phone, course, year, room_id, password, role } = req.body;
  const hashedPW = bcrypt.hashSync(password || "student123", 10);
  
  const targetRole = (req.user.role === 'admin' && role) ? role : 'student';

  try {
    const insertUser = db.prepare(
      "INSERT INTO users (full_name, email, phone, course, year, role, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    const result = insertUser.run(full_name, email, phone, course, year, targetRole, hashedPW);
    const studentId = result.lastInsertRowid;

    if (room_id) {
       db.prepare("INSERT INTO occupancy (student_id, room_id, start_date) VALUES (?, ?, ?)")
         .run(studentId, room_id, new Date().toISOString().split('T')[0]);
    }

    res.json({ id: studentId });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/students/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'registrar') return res.status(403).json({ message: "Apenas registrados ou admin" });
  const { full_name, email, phone, course, year, status, password, room_id, role } = req.body;
  
  try {
    if (password) {
      const hashedPW = bcrypt.hashSync(password, 10);
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashedPW, req.params.id);
    }

    const targetRoleClause = (req.user.role === 'admin' && role) ? ", role = ?" : "";
    const params = [full_name, email, phone, course, year, status || 'active'];
    if (req.user.role === 'admin' && role) params.push(role);
    params.push(req.params.id);

    db.prepare(
      `UPDATE users SET full_name = ?, email = ?, phone = ?, course = ?, year = ?, status = ? ${targetRoleClause} WHERE id = ?`
    ).run(...params);

    if (room_id) {
       db.prepare("UPDATE occupancy SET end_date = ? WHERE student_id = ? AND end_date IS NULL")
         .run(new Date().toISOString().split('T')[0], req.params.id);
       db.prepare("INSERT INTO occupancy (student_id, room_id, start_date) VALUES (?, ?, ?)")
         .run(req.params.id, room_id, new Date().toISOString().split('T')[0]);
    }

    res.json({ message: "Atualizado com sucesso" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Occupancy History
app.get("/api/rooms/:id/history", authenticateToken, (req: any, res) => {
  const history = db.prepare(`
    SELECT o.*, u.full_name as student_name 
    FROM occupancy o 
    JOIN users u ON o.student_id = u.id 
    WHERE o.room_id = ? 
    ORDER BY o.start_date DESC
  `).all(req.params.id);
  res.json(history);
});

// Financial Summary (Debts)
app.get("/api/students/debts", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'finance') return res.status(403).json({ message: "Acesso negado" });
  // Simplificação: Cada mês custa 5000 MT (exemplo)
  // Verificamos os meses pagos vs meses desde a entrada
  const students = db.prepare(`
    SELECT 
      u.id, u.full_name, u.course,
      (SELECT COUNT(*) FROM payments p WHERE p.student_id = u.id) as months_paid,
      (SELECT SUM(amount) FROM payments p WHERE p.student_id = u.id) as total_paid
    FROM users u 
    WHERE u.role = 'student' AND u.status = 'active'
  `).all();
  
  res.json(students);
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
           (SELECT COUNT(*) FROM occupancy o WHERE o.room_id = r.id AND o.end_date IS NULL) as occupants,
           (SELECT GROUP_CONCAT(u.full_name, ';') 
            FROM occupancy o 
            JOIN users u ON o.student_id = u.id 
            WHERE o.room_id = r.id AND o.end_date IS NULL) as occupant_names
    FROM rooms r
    JOIN houses h ON r.house_id = h.id
    JOIN blocks b ON h.block_id = b.id
  `).all();
  res.json(rooms);
});

app.post("/api/occupancy", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'registrar') return res.status(403).json({ message: "Acesso negado" });
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
  if (req.user.role !== 'admin' && req.user.role !== 'finance') return res.status(403).json({ message: "Acesso negado" });
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
  
  if (type === 'broadcast' && !['admin', 'registrar', 'finance'].includes(req.user.role)) {
    return res.status(403).json({ message: "Apenas staff pode enviar comunicados gerais" });
  }
  
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
