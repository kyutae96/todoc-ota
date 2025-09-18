
export type OtaSession = {
  id: string;
  deviceId: string;
  userId: string;
  startedAt: Date;
  endedAt: Date | null;
  status: string;
  slotSelected: number;
  sourcePath: string;
  files: string[];
  chunkSize: number;
  preSlot: number;
  errorCode: string | null;
  appVersion: string;
  deviceName: string;
  events: OtaEvent[];
}

export type OtaEvent = {
    id: string;
    type: 'download' | 'update' | 'reboot' | 'error' | 'sessionStart';
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
    id: string;
}

export type User = {
    uid: string;
    name: string;
    email: string;
    avatar: string;
    organization?: string;
    role: 'manager' | 'admin' | 'unauthorized';
}
