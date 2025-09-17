
import { collection, getDocs, doc, getDoc, query, orderBy, limit, collectionGroup } from 'firebase/firestore';
import { ref, listAll, getMetadata, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { users, products, storageFiles, devices, User, Product, StorageFile, OtaSession } from './data';

const LATENCY = 1000;

type CollectionData = User | Product;

export async function getCollection(collectionName: 'users' | 'products' | 'devices'): Promise<any[]> {
  console.log(`Fetching collection: ${collectionName}`);
  const collRef = collection(db, collectionName);
  const q = query(collRef);
  const querySnapshot = await getDocs(q);
  const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Firestore timestamps need to be converted to JS Dates.
  return data.map(item => {
    const newItem: any = { ...item };
    for (const key in newItem) {
      if (newItem[key]?.toDate) {
        newItem[key] = newItem[key].toDate().toISOString();
      }
    }
    return newItem;
  });
}


export async function getOtaSessions(): Promise<OtaSession[]> {
    console.log('Fetching all ota sessions using collectionGroup');
    const sessionsRef = collectionGroup(db, 'otaSessions');
    const q = query(sessionsRef, orderBy('startedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as OtaSession[];
    
    return sessions.map(s => ({
        ...s,
        startedAt: (s.startedAt as any).toDate(),
        endedAt: s.endedAt ? (s.endedAt as any).toDate() : s.endedAt
      }));
}

export async function getOtaSession(sessionId: string): Promise<OtaSession | undefined> {
    console.log(`Fetching ota session: ${sessionId} using collectionGroup`);
    const sessionsQuery = query(collectionGroup(db, 'otaSessions'));
    const sessionsSnapshot = await getDocs(sessionsQuery);
    
    let sessionDoc;
    for (const doc of sessionsSnapshot.docs) {
        if (doc.id === sessionId) {
            sessionDoc = doc;
            break;
        }
    }

    if (!sessionDoc || !sessionDoc.exists()) {
        console.log(`Session ${sessionId} not found`);
        return undefined;
    }

    const sessionData = { id: sessionDoc.id, ...sessionDoc.data() } as OtaSession;
    
    const eventsRef = collection(sessionDoc.ref, 'events');
    const eventsQuery = query(eventsRef, orderBy('at', 'desc'));
    const eventsSnapshot = await getDocs(eventsQuery);
    const events = eventsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

    return {
        ...sessionData,
        startedAt: (sessionData.startedAt as any).toDate(),
        endedAt: sessionData.endedAt ? (sessionData.endedAt as any).toDate() : sessionData.endedAt,
        events: events.map((e: any) => ({...e, at: e.at.toDate()}))
    } as OtaSession;
}

export async function getStorageFiles(): Promise<StorageFile[]> {
    console.log('Fetching storage files');
    
    const listRef = ref(storage);
    const res = await listAll(listRef);
    
    const files: StorageFile[] = [];

    for (const itemRef of res.items) {
        const metadata = await getMetadata(itemRef);
        files.push({
            id: metadata.generation,
            name: metadata.name,
            path: metadata.fullPath,
            size: metadata.size,
            type: 'file',
            createdAt: new Date(metadata.timeCreated),
            updatedAt: new Date(metadata.updated),
        });
    }

    // Note: listAll does not directly support folders in the same way.
    // This implementation will only list files at the root.
    // For a full folder structure, a more complex recursive approach would be needed.
    
    return files;
}

export async function uploadFileToStorage(file: File, path: string): Promise<StorageFile> {
    console.log(`Uploading file: ${file.name} to ${path}`);
    const fullPath = path ? `${path}/${file.name}` : file.name;
    const storageRef = ref(storage, fullPath);
    const snapshot = await uploadBytes(storageRef, file);
    const metadata = await getMetadata(snapshot.ref);
    
    return {
        id: metadata.generation,
        name: metadata.name,
        path: metadata.fullPath,
        size: metadata.size,
        type: 'file',
        createdAt: new Date(metadata.timeCreated),
        updatedAt: new Date(metadata.updated),
    };
}
