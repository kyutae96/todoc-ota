'use client';

import { getOtaSession } from '@/lib/api';
import { OtaEvent, OtaSession } from '@/lib/data';
import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Download, Power, AlertTriangle, XCircle, FileText, Server, Sliders, Hash, Calendar, Clock, GitBranch, Play, Layers, FileStack } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Progress } from './ui/progress';

function StatusIcon({ status }: { status: OtaSession['status'] }) {
    if (status === 'completed') return <CheckCircle className="size-5 text-green-500" />;
    if (status === 'failed') return <XCircle className="size-5 text-red-500" />;
    if (status === 'in-progress' || status === 'running') return <AlertTriangle className="size-5 text-yellow-500" />;
    return null;
}

function EventIcon({ type }: { type: OtaEvent['type'] }) {
    if (type === 'download') return <Download className="size-4" />;
    if (type === 'update') return <Sliders className="size-4" />;
    if (type === 'reboot') return <Power className="size-4" />;
    if (type === 'error') return <XCircle className="size-4 text-red-500" />;
    if (type === 'sessionStart') return <Play className="size-4" />;
    return null;
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50">
            <Icon className="size-5 text-muted-foreground mt-1" />
            <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium break-all">{value}</span>
            </div>
        </div>
    )
}

export function SessionDetails({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<OtaSession | null>(null);
  const [isLoading, startDataTransition] = useTransition();

  useEffect(() => {
    startDataTransition(async () => {
      const fetchedSession = await getOtaSession(sessionId);
      if (fetchedSession) {
        setSession({
          ...fetchedSession,
          startedAt: fetchedSession.startedAt ? new Date(fetchedSession.startedAt) : new Date(),
          endedAt: fetchedSession.endedAt ? new Date(fetchedSession.endedAt) : null,
          events: fetchedSession.events.map(e => ({ ...e, at: e.at ? new Date(e.at) : new Date() }))
        });
      }
    });
  }, [sessionId]);

  if (isLoading) {
    return <SessionDetailsSkeleton />;
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Session not found.</p>
        </CardContent>
      </Card>
    );
  }

  const downloadEvent = session.events.filter(e => e.type === 'download').sort((a, b) => b.at.getTime() - a.at.getTime())[0];
  const downloadProgress = downloadEvent?.percent ?? 0;

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                   <StatusIcon status={session.status} />
                   <span>OTA Session Details</span>
                   <Badge variant="outline" className="ml-auto">{session.status}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DetailItem icon={Server} label="Device Name" value={session.deviceName} />
                    <DetailItem icon={GitBranch} label="App Version" value={session.appVersion} />
                    <DetailItem icon={FileText} label="Source Path" value={session.sourcePath} />
                    <DetailItem icon={Calendar} label="Started At" value={session.startedAt.toLocaleString()} />
                    <DetailItem icon={Clock} label="Ended At" value={session.endedAt ? session.endedAt.toLocaleString() : 'N/A'} />
                    <DetailItem icon={Hash} label="Error Code" value={session.errorCode ?? 'None'} />
                    <DetailItem icon={Layers} label="Pre-Update Slot" value={session.preSlot} />
                    <DetailItem icon={Layers} label="Post-Update Slot" value={session.currentSlotAfter} />
                    <DetailItem icon={FileStack} label="Files" value={session.files.join(', ')} />
                 </div>
            </CardContent>
        </Card>

        {(session.status === 'in-progress' || session.status === 'running') && downloadEvent && (
            <Card>
                <CardHeader>
                    <CardTitle>Download Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Progress value={downloadProgress} className="h-3" />
                        <span className="font-medium text-muted-foreground">{downloadProgress}%</span>
                    </div>
                     <p className="text-sm text-muted-foreground mt-2">
                        {downloadEvent.processedChunks} / {downloadEvent.totalChunks} chunks
                    </p>
                </CardContent>
            </Card>
        )}

      <Card>
        <CardHeader>
          <CardTitle>Event Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 before:absolute before:inset-y-0 before:w-px before:bg-muted before:left-0">
            {session.events.sort((a,b) => b.at.getTime() - a.at.getTime()).map((event, index) => (
                <div key={event.id} className="relative mb-6">
                    <div className="absolute -left-[35px] top-1.5 flex size-5 items-center justify-center rounded-full bg-background">
                         <div className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <EventIcon type={event.type} />
                         </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <p className="font-medium">{event.message}</p>
                        <span className="text-xs text-muted-foreground ml-auto">{event.at.toLocaleTimeString()}</span>
                    </div>
                    {(event.type === 'download' && event.percent !== undefined) && (
                         <p className="text-sm text-muted-foreground">Progress: {event.percent}%</p>
                    )}
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionDetailsSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-2">
                            <Skeleton className="size-6 rounded-full mt-1" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-5 w-2/3" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent>
                    <div className="relative pl-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="relative mb-6">
                                <Skeleton className="absolute -left-[35px] top-1.5 size-5 rounded-full" />
                                <Skeleton className="h-5 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
