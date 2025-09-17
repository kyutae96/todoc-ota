'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { getStorageFiles, uploadFileToStorage } from '@/lib/api';
import { type StorageFile } from '@/lib/data';
import {
  FileText,
  Folder,
  Loader2,
  Search,
  Upload,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { formatBytes } from '@/lib/utils';
import { Input } from './ui/input';
import { Button } from './ui/button';
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
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';

type Inputs = {
    file: FileList;
    path: string;
};

export function StorageClient() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, startDataTransition] = useTransition();
  const [filter, setFilter] = useState('');
  const { userRole } = useAuth();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<Inputs>();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  const fetchData = () => {
    startDataTransition(async () => {
      const fetchedFiles = await getStorageFiles();
      const processedFiles = fetchedFiles.map(file => ({
        ...file,
        createdAt: new Date(file.createdAt),
        updatedAt: new Date(file.updatedAt),
      }));
      setFiles(processedFiles);
    });
  }
  
  useEffect(() => {
    fetchData();
  }, []);

  const filteredFiles = useMemo(() => {
    return files.filter(file => file.name.toLowerCase().includes(filter.toLowerCase()));
  }, [files, filter]);

  const onUploadSubmit: SubmitHandler<Inputs> = async (data) => {
    const file = data.file[0];
    if (!file) {
        toast({
            variant: "destructive",
            title: "Upload Error",
            description: "Please select a file to upload.",
        });
        return;
    }
    try {
        await uploadFileToStorage(file, data.path);
        toast({
            title: "Upload Successful",
            description: `File "${file.name}" has been uploaded.`,
        });
        fetchData(); // Refresh file list
        reset();
        setUploadDialogOpen(false);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "There was an error uploading your file.",
        });
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Filter files and folders..." 
            className="pl-10"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        {userRole === 'admin' && (
          <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-accent hover:bg-accent/90">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit(onUploadSubmit)}>
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                  <DialogDescription>
                    Select a file and specify a destination path in Firebase Storage.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="file">File</Label>
                    <Input id="file" type="file" {...register("file", { required: true })} />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="path">Path (optional)</Label>
                    <Input id="path" placeholder="/images/avatars" {...register("path")} />
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
            .sort((a,b) => (a.type > b.type) ? 1 : ((b.type > a.type) ? -1 : 0)) // folders first
            .map(file => (
            <Card key={file.id} className="flex flex-col justify-between">
              <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                {file.type === 'folder' ? 
                  <Folder className="size-8 text-accent" /> :
                  <FileText className="size-8 text-primary" />
                }
                <CardTitle className="font-sans text-base font-medium leading-tight truncate" title={file.name}>{file.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground pb-4">
                <p>Path: {file.path}</p>
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
                <p className="text-muted-foreground">No files or folders found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
