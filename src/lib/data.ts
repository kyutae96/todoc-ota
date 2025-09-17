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

export type OtaSession = {
  id: string;
  deviceId: string;
  userId: string;
  startedAt: Date;
  endedAt: Date;
  status: 'completed' | 'failed' | 'in-progress';
  slotSelected: 'A' | 'B';
  sourcePath: string;
  files: string[];
  fileSize: number;
  chunkSize: number;
  preSlot: 'A' | 'B';
  currentSlotAfter: 'A' | 'B';
  errorCode: number | null;
  appVersion: string;
  deviceName: string;
  events: OtaEvent[];
}

export type OtaEvent = {
    id: string;
    type: 'download' | 'update' | 'reboot' | 'error';
    at: Date;
    slot: 'A' | 'B';
    fileId?: string;
    percent?: number;
    processedChunks?: number;
    totalChunks?: number;
    message: string;
}

export type SlotHistory = {
    id: string;
    at: Date;
    fromSlot: 'A' | 'B';
    toSlot: 'A' | 'B';
    reason: string;
    sessionId: string;
}

export type Device = {
    id: string; // deviceName
    otaSessions: OtaSession[];
    slotHistory: SlotHistory[];
}


function createDate(daysAgo: number, hoursAgo: number = 0, minutesAgo: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
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
    { id: 'file_1', name: 'Q4_Report.pdf', path: '/reports', size: 2097152, type: 'file', createdAt: createDate(5), updatedAt: new Date(createDate(5)) },
    { id: 'file_2', name: 'marketing_assets', path: '/', size: 0, type: 'folder', createdAt: createDate(30), updatedAt: new Date(createDate(10)) },
    { id: 'file_3', name: 'header_logo.png', path: '/marketing_assets', size: 51200, type: 'file', createdAt: createDate(25), updatedAt: new Date(createDate(25)) },
    { id: 'file_4', name: 'promo_video.mp4', path: '/marketing_assets', size: 52428800, type: 'file', createdAt: createDate(20), updatedAt: new Date(createDate(15)) },
    { id: 'file_5', name: 'user_guides', path: '/', size: 0, type: 'folder', createdAt: createDate(90), updatedAt: new Date(createDate(45)) },
    { id: 'file_6', name: 'Onboarding.docx', path: '/internal', size: 1048576, type: 'file', createdAt: createDate(2), updatedAt: new Date(createDate(1)) },
];

const otaEvents: Record<string, OtaEvent[]> = {
  'ota-session-001': [
    { id: 'evt-001-1', type: 'download', at: createDate(1, 2, 29), slot: 'B', fileId: 'v2.1.0.bin', percent: 0, processedChunks: 0, totalChunks: 2560, message: 'Download started for v2.1.0.bin' },
    { id: 'evt-001-2', type: 'download', at: createDate(1, 2, 25), slot: 'B', fileId: 'v2.1.0.bin', percent: 50, processedChunks: 1280, totalChunks: 2560, message: 'Download 50% complete' },
    { id: 'evt-001-3', type: 'download', at: createDate(1, 2, 20), slot: 'B', fileId: 'v2.1.0.bin', percent: 100, processedChunks: 2560, totalChunks: 2560, message: 'Download finished' },
    { id: 'evt-001-4', type: 'update', at: createDate(1, 2, 19), slot: 'B', message: 'Verification successful' },
    { id: 'evt-001-5', type: 'update', at: createDate(1, 2, 18), slot: 'B', message: 'Applying update' },
    { id: 'evt-001-6', type: 'reboot', at: createDate(1, 2, 15), slot: 'B', message: 'Rebooting device to apply update' },
    { id: 'evt-001-7', type: 'update', at: createDate(1, 2, 12), slot: 'B', message: 'Update successful, switching to slot B' },
  ],
  'ota-session-002': [
    { id: 'evt-002-1', type: 'download', at: createDate(2, 4, 59), slot: 'A', fileId: 'v1.5.2.bin', percent: 0, message: 'Download started for v1.5.2.bin' },
    { id: 'evt-002-2', type: 'download', at: createDate(2, 4, 55), slot: 'A', fileId: 'v1.5.2.bin', percent: 75, message: 'Download 75% complete' },
    { id: 'evt-002-3', type: 'error', at: createDate(2, 4, 50), slot: 'A', message: 'Network connection lost during download' },
  ],
  'ota-session-003': [
    { id: 'evt-003-1', type: 'download', at: createDate(0, 0, 59), slot: 'A', fileId: 'v2.2.0.bin', percent: 0, processedChunks: 0, totalChunks: 3072, message: 'Download started for v2.2.0.bin' },
    { id: 'evt-003-2', type: 'download', at: createDate(0, 0, 45), slot: 'A', fileId: 'v2.2.0.bin', percent: 25, processedChunks: 768, totalChunks: 3072, message: 'Download 25% complete' },
    { id: 'evt-003-3', type: 'download', at: createDate(0, 0, 30), slot: 'A', fileId: 'v2.2.0.bin', percent: 50, processedChunks: 1536, totalChunks: 3072, message: 'Download 50% complete' },
  ]
};

export const otaSessions: OtaSession[] = [
    {
      id: 'ota-session-001',
      deviceId: 'device-001',
      userId: 'user-001',
      startedAt: createDate(1, 2, 30),
      endedAt: createDate(1, 2, 10),
      status: 'completed',
      slotSelected: 'B',
      sourcePath: '/firmware/v2.1.0.bin',
      files: ['v2.1.0.bin'],
      fileSize: 10485760,
      chunkSize: 4096,
      preSlot: 'A',
      currentSlotAfter: 'B',
      errorCode: null,
      appVersion: '2.1.0',
      deviceName: 'device-001',
      events: otaEvents['ota-session-001']
    },
    {
      id: 'ota-session-002',
      deviceId: 'device-002',
      userId: 'user-002',
      startedAt: createDate(2, 5, 0),
      endedAt: createDate(2, 4, 50),
      status: 'failed',
      slotSelected: 'A',
      sourcePath: '/firmware/v1.5.2.bin',
      files: ['v1.5.2.bin'],
      fileSize: 8388608,
      chunkSize: 4096,
      preSlot: 'B',
      currentSlotAfter: 'B',
      errorCode: 504,
      appVersion: '1.5.2',
      deviceName: 'device-002',
      events: otaEvents['ota-session-002']
    },
     {
      id: 'ota-session-003',
      deviceId: 'device-001',
      userId: 'user-003',
      startedAt: createDate(0, 1, 0),
      endedAt: createDate(0, 0, 30),
      status: 'in-progress',
      slotSelected: 'A',
      sourcePath: '/firmware/v2.2.0.bin',
      files: ['v2.2.0.bin'],
      fileSize: 12582912,
      chunkSize: 4096,
      preSlot: 'B',
      currentSlotAfter: 'B',
      errorCode: null,
      appVersion: '2.2.0',
      deviceName: 'device-001',
      events: otaEvents['ota-session-003']
    }
];

export const devices: Device[] = [
    { 
        id: 'device-001',
        otaSessions: [otaSessions[0], otaSessions[2]],
        slotHistory: [],
    },
    { 
        id: 'device-002',
        otaSessions: [otaSessions[1]],
        slotHistory: [],
    },
    { 
        id: 'device-003',
        otaSessions: [],
        slotHistory: [],
    },
];
