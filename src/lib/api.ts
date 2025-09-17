

import { collection, getDocs, doc, getDoc, query, orderBy, limit, collectionGroup, where } from 'firebase/firestore';
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

const getMockStorageFiles = async (): Promise<StorageFile[]> => {
    console.log('Fetching MOCK storage files from /OTA');
    return new Promise(resolve => {
        setTimeout(() => {
            const otaFiles = storageFiles.filter(file => file.path.startsWith('OTA') || file.path === 'OTA' || file.name === 'OTA');
             const processedFiles = otaFiles.map(file => {
                if (file.path === 'OTA') {
                    // This is a folder inside OTA, adjust its path for display
                    return { ...file, path: `OTA/${file.name}`};
                }
                return file;
            }).filter(f => f.path.startsWith('OTA'));
            
            // Create a root OTA folder if it doesn't exist from the mock data
            if (!processedFiles.find(f => f.type ==='folder' && f.name === 'OTA')) {
                 processedFiles.unshift({
                    id: 'folder_ota',
                    name: 'OTA',
                    path: '/',
                    size: 0,
                    type: 'folder',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            resolve(processedFiles);
        }, LATENCY/3);
    });
}


export async function getCollection(collectionName: 'users' | 'products' | 'devices'): Promise<any[]> {
  // return getMockCollection(collectionName);
  try {
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    return [];
  }
}


export async function getOtaSessions(): Promise<OtaSession[]> {
    // return getMockOtaSessions();
    try {
        const deviceDocs = await getDocs(collection(db, 'devices'));
        const sortedDevices = deviceDocs.docs.sort((a,b) => a.id.localeCompare(b.id));

        const allSessions: OtaSession[] = [];

        for (const deviceDoc of sortedDevices) {
            const sessionsQuery = query(collection(db, 'devices', deviceDoc.id, 'otaSessions'));
            const sessionsSnapshot = await getDocs(sessionsQuery);
            const sessions = sessionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as OtaSession));
            allSessions.push(...sessions);
        }
        return allSessions;
    } catch (error) {
        console.error("Error fetching OTA sessions:", error);
        return [];
    }
}

export async function getOtaSession(sessionId: string): Promise<OtaSession | undefined> {
    // return getMockOtaSession(sessionId);
    try {
        const sessionsQuery = query(collectionGroup(db, 'otaSessions'), where('__name__', '==', sessionId));
        const snapshot = await getDocs(sessionsQuery);

        if (snapshot.empty) {
            console.log(`No OTA session found with ID: ${sessionId}`);
            return undefined;
        }

        const sessionDoc = snapshot.docs[0];
        const sessionData = sessionDoc.data() as OtaSession;

        const eventsQuery = query(collection(sessionDoc.ref, 'events'), orderBy('at', 'desc'));
        const eventsSnapshot = await getDocs(eventsQuery);

        const events = eventsSnapshot.docs.map(eventDoc => ({
            id: eventDoc.id,
            ...eventDoc.data()
        }));

        return {
            id: sessionDoc.id,
            ...sessionData,
            events: events,
        } as OtaSession;

    } catch (error) {
        console.error(`Error fetching OTA session ${sessionId}:`, error);
        return undefined;
    }
}

export async function getStorageFiles(): Promise<StorageFile[]> {
    // return getMockStorageFiles();
    try {
        const listRef = ref(storage, 'OTA/');
        const res = await listAll(listRef);
        const files: StorageFile[] = [];

        for (const item of res.items) {
            const metadata = await getMetadata(item);
            files.push({
                id: item.fullPath,
                name: item.name,
                path: item.fullPath.substring(0, item.fullPath.lastIndexOf('/')),
                size: metadata.size,
                type: 'file',
                createdAt: new Date(metadata.timeCreated),
                updatedAt: new Date(metadata.updated),
            });
        }

        for (const prefix of res.prefixes) {
            files.push({
                id: prefix.fullPath,
                name: prefix.name,
                path: prefix.fullPath.substring(0, prefix.fullPath.lastIndexOf('/')),
                size: 0,
                type: 'folder',
                createdAt: new Date(), // Folders don't have creation date in Storage
                updatedAt: new Date(),
            });
        }
        return files;
    } catch (error) {
        console.error("Error fetching storage files:", error);
        return [];
    }
}

export async function uploadFileToStorage(file: File, path: string): Promise<StorageFile> {
    const basePath = 'OTA';
    const fullPath = path ? `${basePath}/${path}/${file.name}` : `${basePath}/${file.name}`;
    console.log(`Uploading file: ${file.name} to ${fullPath}`);
    
    try {
        const storageRef = ref(storage, fullPath);
        const uploadResult = await uploadBytes(storageRef, file);
        const metadata = await getMetadata(uploadResult.ref);

        const newFile: StorageFile = {
            id: metadata.fullPath,
            name: metadata.name,
            path: metadata.fullPath.substring(0, metadata.fullPath.lastIndexOf('/')),
            size: metadata.size,
            type: 'file',
            createdAt: new Date(metadata.timeCreated),
            updatedAt: new Date(metadata.updated),
        };
        return newFile;
    } catch(error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}
