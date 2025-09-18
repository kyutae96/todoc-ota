
'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useTransition } from 'react';
import { getStorageFiles, uploadFileToStorage, deleteStorageFile } from '@/lib/api';
import { type StorageFile } from '@/lib/api';
import {
  FileText,
  Folder,
  Loader2,
  RefreshCw,
  Search,
  Upload,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { formatBytes } from '@/lib/utils';
import { Input } from './ui/input';
import { Button, buttonVariants } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

type Inputs = {
    file: FileList;
};

function Breadcrumbs({ path, onNavigate }: { path: string, onNavigate: (newPath: string) => void }) {
    const parts = useMemo(() => path.replace(/\/$/, '').split('/'), [path]);
    
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {parts.map((part, index) => {
                const currentPath = parts.slice(0, index + 1).join('/') + '/';
                return (
                    <React.Fragment key={index}>
                        {index > 0 && <ChevronRight className="h-4 w-4" />}
                        <button 
                            onClick={() => onNavigate(currentPath)} 
                            className={cn("hover:text-foreground", { 'font-semibold text-foreground': index === parts.length - 1 })}
                            disabled={index === parts.length - 1}
                        >
                            {part}
                        </button>
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export function StorageClient() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, startDataTransition] = useTransition();
  const [filter, setFilter] = useState('');
  const { userRole } = useAuth();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<Inputs>();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('OTA/');
  const [fileToDelete, setFileToDelete] = useState<StorageFile | null>(null);

  const fetchData = (path: string = currentPath) => {
    startDataTransition(async () => {
      const fetchedFiles = await getStorageFiles(path);
      const processedFiles = fetchedFiles.map(file => ({
        ...file,
        createdAt: new Date(file.createdAt),
        updatedAt: new Date(file.updatedAt),
      }));
      setFiles(processedFiles);
      setCurrentPath(path);
    });
  }
  
  useEffect(() => {
    fetchData('OTA/');
  }, []);

  const handleFolderClick = (path: string) => {
    fetchData(path);
  };

  const filteredFiles = useMemo(() => {
    return files.filter(file => file.name.toLowerCase().includes(filter.toLowerCase()));
  }, [files, filter]);

  const onUploadSubmit: SubmitHandler<Inputs> = async (data) => {
    const files = data.file;
    if (!files || files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Upload Error',
        description: 'Please select at least one file to upload.',
      });
      return;
    }

    let successfulUploads = 0;
    let failedUploads = 0;
    const totalFiles = files.length;

    for (const file of Array.from(files)) {
      try {
        await uploadFileToStorage(file, currentPath);
        successfulUploads++;
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        failedUploads++;
      }
    }

    if (successfulUploads > 0) {
      toast({
        title: 'Upload Complete',
        description: `${successfulUploads} of ${totalFiles} file(s) uploaded successfully to ${currentPath}.`,
      });
    }

    if (failedUploads > 0) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: `${failedUploads} file(s) could not be uploaded.`,
      });
    }
    
    fetchData(); // Refresh file list
    reset();
    setUploadDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
        await deleteStorageFile(fileToDelete.path);
        toast({
            title: "Deletion Successful",
            description: `File "${fileToDelete.name}" has been deleted.`,
        });
        fetchData();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "There was an error deleting the file.",
        });
    } finally {
        setFileToDelete(null);
    }
  };


  return (
    <div className="space-y-6">
       <Card>
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter files and folders..." 
                  className="pl-10"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => fetchData()} disabled={isLoading} className="w-full md:w-auto">
                      <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                      Refresh
                  </Button>
                  {userRole === 'admin' && (
                    <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full md:w-auto bg-accent hover:bg-accent/90">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload File(s)
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit(onUploadSubmit)}>
                          <DialogHeader>
                            <DialogTitle>Upload Files</DialogTitle>
                            <DialogDescription>
                              The files will be uploaded to the current directory: <span className="font-medium text-foreground">{currentPath}</span>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                              <Label htmlFor="file">Files</Label>
                              <Input id="file" type="file" {...register("file", { required: true })} multiple />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Upload
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
              </div>
            </CardContent>
          </Card>
      
      <Breadcrumbs path={currentPath} onNavigate={fetchData} />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                 <Skeleton className="size-8" />
                 <Skeleton className="h-5 flex-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : filteredFiles.length > 0 ? (
          filteredFiles
            .sort((a,b) => (a.type > b.type) ? -1 : ((b.type > a.type) ? 1 : 0)) // folders first
            .map(file => (
            <Card 
                key={file.id} 
                className={cn("flex flex-col justify-between", file.type === 'folder' && "cursor-pointer hover:border-primary/50 hover:shadow-md transition-shadow")}
                onClick={(e) => {
                    // prevent navigation when clicking on a button inside the card
                    if (e.target instanceof HTMLElement && e.target.closest('button')) return;
                    if (file.type === 'folder') handleFolderClick(file.path);
                }}
            >
              <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                {file.type === 'folder' ? 
                  <Folder className="size-8 text-accent" /> :
                  <FileText className="size-8 text-primary" />
                }
                <CardTitle className="font-sans text-base font-medium leading-tight truncate" title={file.name}>{file.name}</CardTitle>
                 {userRole === 'admin' && file.type === 'file' && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-7 ml-auto shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setFileToDelete(file)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                )}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground pb-4">
                 <p className='truncate'>Path: /{file.path}</p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground pt-2 border-t">
                {file.type === 'file' ? (
                  <span>Size: {formatBytes(file.size)}</span>
                ) : (
                  <span>Folder</span>
                )}
                <span className="ml-auto">Updated: {file.updatedAt.toLocaleDateString()}</span>
              </CardFooter>
            </Card>
          ))
        ) : (
            <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">This folder is empty.</p>
            </div>
        )}
      </div>
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the file <span className="font-medium text-foreground">{fileToDelete?.name}</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
