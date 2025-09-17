
import { collection, getDocs, doc, getDoc, query, orderBy, limit, collectionGroup } from 'firebase/firestore';
import { ref, listAll, getMetadata, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { users, products, storageFiles, devices, User, Product, StorageFile, OtaSession, otaSessions } from './data';

const LATENCY = 1000;

type CollectionData = User | Product;

// Mock data functions
const getMockCollection = (collectionName: 'users' | 'products' | 'devices'): Promise<any[]> => {
    console.log(`Fetching MOCK collection: ${collectionName}`);
    return new Promise(resolve => {
        setTimeout(() => {
            if (collectionName === 'users') resolve(users);
            if (collectionName === 'products') resolve(products);
            if (collectionName === 'devices') resolve(devices.map(d => ({...d, name: d.id, status: 'online', lastSeen: new Date()})));
        }, LATENCY/4);
    });
}

const getMockOtaSessions = (): Promise<OtaSession[]> => {
    console.log('Fetching MOCK ota sessions');
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(otaSessions);
        }, LATENCY/2);
    });
}

const getMockOtaSession = (sessionId: string): Promise<OtaSession | undefined> => {
    console.log(`Fetching MOCK ota session: ${sessionId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(otaSessions.find(s => s.id === sessionId));
        }, LATENCY/2);
    });
}

const getMockStorageFiles = (): Promise<StorageFile[]> => {
    console.log('Fetching MOCK storage files from /OTA');
    return new Promise(resolve => {
        setTimeout(() => {
            // Filter files to simulate being in the OTA directory
            const otaPath = 'OTA';
            const otaFiles = storageFiles
              .filter(f => f.path.startsWith(`/${otaPath}`) || f.name === otaPath || f.path === '/')
              .map(f => {
                  if (f.type === 'folder' && f.name !== otaPath) {
                      return { ...f, path: f.path.replace(`/${otaPath}`, '') || '/' };
                  }
                  if (f.type === 'file') {
                      return { ...f, path: f.path.replace(`/${otaPath}`, '') || '/' };
                  }
                  return f;
              })
              .filter(f => f.name !== 'reports' && f.name !== 'internal' && f.name !== 'Q4_Report.pdf' && f.name !== 'Onboarding.docx'); // a bit brittle

            resolve(storageFiles);
        }, LATENCY/3);
    });
}


export async function getCollection(collectionName: 'users' | 'products' | 'devices'): Promise<any[]> {
  return getMockCollection(collectionName);
}


export async function getOtaSessions(): Promise<OtaSession[]> {
    return getMockOtaSessions();
}

export async function getOtaSession(sessionId: string): Promise<OtaSession | undefined> {
    return getMockOtaSession(sessionId);
}

export async function getStorageFiles(): Promise<StorageFile[]> {
    return getMockStorageFiles();
}

export async function uploadFileToStorage(file: File, path: string): Promise<StorageFile> {
    const basePath = 'OTA';
    console.log(`Uploading file: ${file.name} to ${basePath}/${path}`);
    const fullPath = path ? `${basePath}/${path}/${file.name}` : `${basePath}/${file.name}`;
    
    // This is a mock upload, we're not actually using Firebase storage here
    return new Promise(resolve => {
        setTimeout(() => {
            const newFile: StorageFile = {
                id: `mock_${new Date().getTime()}`,
                name: file.name,
                path: fullPath,
                size: file.size,
                type: 'file',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            // You might want to add the new file to the mock storageFiles array
            // storageFiles.push(newFile);
            resolve(newFile);
        }, LATENCY);
    });
}
