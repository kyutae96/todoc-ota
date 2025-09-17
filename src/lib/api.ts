import { users, products, storageFiles, devices, User, Product, StorageFile, Device, otaSessions, OtaSession } from './data';

const LATENCY = 1000;

type CollectionData = User | Product | Omit<Device, 'otaSessions' | 'slotHistory'>;

export async function getCollection(collectionName: 'users' | 'products' | 'devices'): Promise<CollectionData[]> {
  console.log(`Fetching collection: ${collectionName}`);
  return new Promise(resolve => {
    setTimeout(() => {
      if (collectionName === 'users') {
        resolve(JSON.parse(JSON.stringify(users)));
      } else if (collectionName === 'products') {
        resolve(JSON.parse(JSON.stringify(products)));
      } else {
        const deviceData = devices.map(d => ({
            id: d.id,
        }));
        resolve(JSON.parse(JSON.stringify(deviceData)));
      }
    }, LATENCY);
  });
}

export async function getOtaSessions(): Promise<OtaSession[]> {
    console.log('Fetching all ota sessions');
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(otaSessions)));
        }, LATENCY);
    });
}

export async function getOtaSession(sessionId: string): Promise<OtaSession | undefined> {
    console.log(`Fetching ota session: ${sessionId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const session = otaSessions.find(s => s.id === sessionId);
            resolve(session ? JSON.parse(JSON.stringify(session)) : undefined);
        }, LATENCY);
    });
}

export async function getStorageFiles(): Promise<StorageFile[]> {
    console.log('Fetching storage files');
    return new Promise(resolve => {
        setTimeout(() => {
            const parsedFiles = JSON.parse(JSON.stringify(storageFiles));
            resolve(parsedFiles);
        }, LATENCY);
    });
}

export async function uploadFileToStorage(file: {name: string; size: number}, path: string): Promise<StorageFile> {
    console.log(`Uploading file: ${file.name} to ${path}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const newFile: StorageFile = {
                id: `file-${Date.now()}`,
                name: file.name,
                path: path || '/',
                size: file.size,
                type: 'file',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            storageFiles.push(newFile);
            resolve(newFile);
        }, LATENCY);
    });
}
