import { users, products, storageFiles, User, Product, StorageFile } from './data';

const LATENCY = 1000;

export async function getCollection(collectionName: 'users' | 'products'): Promise<(User | Product)[]> {
  console.log(`Fetching collection: ${collectionName}`);
  return new Promise(resolve => {
    setTimeout(() => {
      if (collectionName === 'users') {
        resolve(JSON.parse(JSON.stringify(users)));
      } else {
        resolve(JSON.parse(JSON.stringify(products)));
      }
    }, LATENCY);
  });
}

export async function getStorageFiles(): Promise<StorageFile[]> {
    console.log('Fetching storage files');
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(storageFiles)));
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
