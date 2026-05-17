-- Database schema for UniLog

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'student')) NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  course TEXT,
  year INTEGER,
  location TEXT,
  status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL
);

CREATE TABLE IF NOT EXISTS houses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_id INTEGER,
  number INTEGER NOT NULL,
  FOREIGN KEY (block_id) REFERENCES blocks(id)
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  house_id INTEGER,
  number INTEGER NOT NULL,
  capacity INTEGER DEFAULT 2,
  FOREIGN KEY (house_id) REFERENCES houses(id)
);

CREATE TABLE IF NOT EXISTS occupancy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  room_id INTEGER,
  start_date DATE NOT NULL,
  end_date DATE,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  amount REAL NOT NULL,
  payment_date DATE NOT NULL,
  reference_month TEXT NOT NULL,
  method TEXT NOT NULL,
  id_comprovativo TEXT,
  FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER,
  recipient_id INTEGER, -- NULL for broadcast
  content TEXT NOT NULL,
  type TEXT CHECK(type IN ('individual', 'broadcast')) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);
