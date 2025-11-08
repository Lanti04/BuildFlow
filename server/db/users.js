// Simple in-memory user database
// In production, use a real database like PostgreSQL, MongoDB, etc.

import bcrypt from 'bcryptjs';

let users = [];
let nextId = 1;

export async function getUsers() {
  return users.map(user => ({
    ...user,
    password: undefined, // Don't return password
  }));
}

export async function getUserById(id) {
  const user = users.find(u => u.id === id);
  if (user) {
    return {
      ...user,
      password: undefined,
    };
  }
  return null;
}

export async function getUserByEmail(email) {
  return users.find(u => u.email === email) || null;
}

export async function createUser(userData) {
  const user = {
    id: nextId++,
    email: userData.email,
    password: userData.password,
    name: userData.name || userData.email,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return {
    ...user,
    password: undefined,
  };
}

export async function updateUser(id, updates) {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
  };
  return {
    ...users[userIndex],
    password: undefined,
  };
}

// Initialize with a test user (for development)
// Note: Password must be hashed before calling createUser
export async function initializeTestUser() {
  if (users.length === 0) {
    // Hash the password (same as in auth.js)
    const hashedPassword = await bcrypt.hash('test123', 10);
    await createUser({
      email: 'test@buildflow.com',
      password: hashedPassword,
      name: 'Test User',
    });
    console.log('✅ Test user created: test@buildflow.com / test123');
  }
}

