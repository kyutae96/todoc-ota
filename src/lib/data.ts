export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  createdAt: Date;
  lastLogin: Date;
  status: 'active' | 'inactive';
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: Date;
};

export type StorageFile = {
  id: string;
  name: string;
  path: string;
  size: number;
  type: 'file' | 'folder';
  createdAt: Date;
  updatedAt: Date;
};

function createDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

export const users: User[] = [
  { id: 'usr_1', name: 'Alice Johnson', email: 'alice.j@example.com', role: 'admin', createdAt: createDate(30), lastLogin: createDate(1), status: 'active' },
  { id: 'usr_2', name: 'Bob Williams', email: 'bob.w@example.com', role: 'manager', createdAt: createDate(60), lastLogin: createDate(2), status: 'active' },
  { id: 'usr_3', name: 'Charlie Brown', email: 'charlie.b@example.com', role: 'viewer', createdAt: createDate(90), lastLogin: createDate(5), status: 'inactive' },
  { id: 'usr_4', name: 'Diana Miller', email: 'diana.m@example.com', role: 'manager', createdAt: createDate(25), lastLogin: createDate(0), status: 'active' },
  { id: 'usr_5', name: 'Ethan Davis', email: 'ethan.d@example.com', role: 'viewer', createdAt: createDate(120), lastLogin: createDate(10), status: 'active' },
  { id: 'usr_6', name: 'Fiona Garcia', email: 'fiona.g@example.com', role: 'manager', createdAt: createDate(15), lastLogin: createDate(3), status: 'active' },
];

export const products: Product[] = [
  { id: 'prod_1', name: 'Quantum Laptop', category: 'Electronics', price: 1200, stock: 50, createdAt: createDate(10) },
  { id: 'prod_2', name: 'Smart Desk Chair', category: 'Furniture', price: 350, stock: 120, createdAt: createDate(20) },
  { id: 'prod_3', name: 'AI Coffee Maker', category: 'Appliances', price: 150, stock: 200, createdAt: createDate(5) },
  { id: 'prod_4', name: 'Ergonomic Keyboard', category: 'Electronics', price: 95, stock: 300, createdAt: createDate(45) },
  { id: 'prod_5', name: 'Standing Desk', category: 'Furniture', price: 600, stock: 80, createdAt: createDate(32) },
  { id: 'prod_6', 'name': 'Noise-Cancelling Headphones', category: 'Electronics', price: 250, stock: 150, createdAt: createDate(8) },
];

export const storageFiles: StorageFile[] = [
    { id: 'file_1', name: 'Q4_Report.pdf', path: '/reports', size: 2097152, type: 'file', createdAt: createDate(5), updatedAt: createDate(5) },
    { id: 'file_2', name: 'marketing_assets', path: '/', size: 0, type: 'folder', createdAt: createDate(30), updatedAt: createDate(10) },
    { id: 'file_3', name: 'header_logo.png', path: '/marketing_assets', size: 51200, type: 'file', createdAt: createDate(25), updatedAt: createDate(25) },
    { id: 'file_4', name: 'promo_video.mp4', path: '/marketing_assets', size: 52428800, type: 'file', createdAt: createDate(20), updatedAt: createDate(15) },
    { id: 'file_5', name: 'user_guides', path: '/', size: 0, type: 'folder', createdAt: createDate(90), updatedAt: createDate(45) },
    { id: 'file_6', name: 'Onboarding.docx', path: '/internal', size: 1048576, type: 'file', createdAt: createDate(2), updatedAt: createDate(1) },
];
