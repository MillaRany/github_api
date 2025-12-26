import { database } from './db';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await database.run(createUsersTable);
};

const seedUsers = async () => {
  const existingUser = await database.get('SELECT id FROM users LIMIT 1');
  
  if (existingUser) {
    return;
  }

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  await database.run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Admin User', 'admin@example.com', adminPassword, UserRole.ADMIN]
  );

  await database.run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Regular User', 'user@example.com', userPassword, UserRole.USER]
  );
};

const initDatabase = async () => {
  try {
    await database.connect();
    await createTables();
    await seedUsers();
    await database.close();
  } catch (error) {
    process.exit(1);
  }
};

initDatabase();
