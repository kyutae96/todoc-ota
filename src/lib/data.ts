export type OtaSession = {
  id: string;
  deviceId: string;
  userId: string;
  startedAt: Date;
  endedAt: Date | null;
  status: 'completed' | 'failed' | 'in-progress' | 'running';
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
