
import { collection, getDocs, doc, getDoc, query, orderBy, limit, collectionGroup, where } from 'firebase/firestore';
import { ref, listAll, getMetadata, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { OtaSession, Device } from './data';

export async function getDevices(): Promise<Device[]> {
    try {
        const sessionsQuery = collectionGroup(db, 'otaSessions');
        const querySnapshot = await getDocs(sessionsQuery);
        const deviceNames = new Set<string>();
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.deviceName) {
                deviceNames.add(data.deviceName);
            }
        });
        const devices = Array.from(deviceNames).map(id => ({ id }));
        return devices.sort((a,b) => a.id.localeCompare(b.id));
    } catch (error) {
        console.error("Error fetching devices from sessions:", error);
        return [];
    }
}

export async function getOtaSessions(): Promise<OtaSession[]> {
    try {
        const sessionsQuery = query(collectionGroup(db, 'otaSessions'));
        const sessionsSnapshot = await getDocs(sessionsQuery);
        
        const allSessions = sessionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startedAt: data.startedAt?.toDate(),
                endedAt: data.endedAt?.toDate(),
            } as OtaSession;
        });

        return allSessions;
    } catch (error) {
        console.error("Error fetching OTA sessions:", error);
        return [];
    }
}

export async function getOtaSession(sessionId: string): Promise<OtaSession | undefined> {
    try {
        const sessionQuery = query(collectionGroup(db, 'otaSessions'), where('__name__', '==', sessionId), limit(1));
        const snapshot = await getDocs(sessionQuery);

        if (snapshot.empty) {
            const fallbackQuery = query(collectionGroup(db, 'otaSessions'));
            const fallbackSnapshot = await getDocs(fallbackQuery);
            const sessionDoc = fallbackSnapshot.docs.find(d => d.id === sessionId);
            
            if (!sessionDoc) {
                console.log(`No OTA session found with ID: ${sessionId}`);
                return undefined;
            }
            const sessionData = sessionDoc.data();
            const eventsQuery = query(collection(sessionDoc.ref, 'events'), orderBy('at', 'desc'));
            const eventsSnapshot = await getDocs(eventsQuery);

            const events = eventsSnapshot.docs.map(eventDoc => {
                const eventData = eventDoc.data();
                return {
                    id: eventDoc.id,
                    ...eventData,
                    at: eventData.at?.toDate(),
                }
            });

            return {
                id: sessionDoc.id,
                ...sessionData,
                startedAt: sessionData.startedAt?.toDate(),
                endedAt: sessionData.endedAt?.toDate(),
                events: events,
            } as OtaSession;
        }

        const sessionDoc = snapshot.docs[0];
        const sessionData = sessionDoc.data();

        const eventsQuery = query(collection(sessionDoc.ref, 'events'), orderBy('at', 'desc'));
        const eventsSnapshot = await getDocs(eventsQuery);

        const events = eventsSnapshot.docs.map(eventDoc => {
            const eventData = eventDoc.data();
            return {
                id: eventDoc.id,
                ...eventData,
                at: eventData.at?.toDate(),
            }
        });

        return {
            id: sessionDoc.id,
            ...sessionData,
            startedAt: sessionData.startedAt?.toDate(),
            endedAt: sessionData.endedAt?.toDate(),
            events: events,
        } as OtaSession;

    } catch (error) {
        console.error(`Error fetching OTA session ${sessionId}:`, error);
        return undefined;
    }
}

export async function getStorageFiles(): Promise<StorageFile[]> {
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
                createdAt: new Date(), 
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

// Add StorageFile type because it was removed from data.ts
export type StorageFile = {
  id: string;
  name: string;
  path: string;
  size: number;
  type: 'file' | 'folder';
  createdAt: Date;
  updatedAt: Date;
};
