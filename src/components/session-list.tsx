'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getOtaSessions } from '@/lib/api';
import { type OtaSession } from '@/lib/data';
import { ArrowUpDown, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from './ui/card';

const PAGE_SIZE = 10;

function StatusIcon({ status }: { status: OtaSession['status'] }) {
    if (status === 'completed') return <CheckCircle className="size-4 text-green-500" />;
    if (status === 'failed') return <XCircle className="size-4 text-red-500" />;
    if (status === 'in-progress') return <AlertCircle className="size-4 text-yellow-500" />;
    return null;
}

export function SessionList() {
  const [sessions, setSessions] = useState<OtaSession[]>([]);
  const [isLoading, startDataTransition] = useTransition();
  const router = useRouter();

  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<keyof OtaSession | null>('startedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    startDataTransition(async () => {
      setSessions([]);
      setCurrentPage(1);
      const fetchedSessions = await getOtaSessions();
      setSessions(fetchedSessions.map(s => ({
        ...s,
        startedAt: new Date(s.startedAt),
        endedAt: s.endedAt ? new Date(s.endedAt) : s.endedAt
      })));
    });
  }, []);

  const handleSort = (field: keyof OtaSession) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    let filtered = sessions;

    if (filter) {
      filtered = sessions.filter((session) =>
        Object.values(session).some((value) =>
          String(value).toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    if (sortBy) {
        filtered.sort((a, b) => {
            const aValue = a[sortBy as keyof typeof a];
            const bValue = b[sortBy as keyof typeof b];

            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;
            
            if (sortBy === 'startedAt' || sortBy === 'endedAt') {
                const dateA = new Date(aValue as string | number | Date).getTime();
                const dateB = new Date(bValue as string | number | Date).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return filtered;
  }, [sessions, filter, sortBy, sortOrder]);


  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const formatCell = (item: OtaSession, field: keyof OtaSession) => {
    const value = item[field as keyof typeof item];

    if (field === 'startedAt' || field === 'endedAt') {
        return value ? new Date(value as string | number | Date).toLocaleString() : 'N/A';
    }
    
    if (field === 'status') {
      return (
        <Badge variant={
            value === 'completed' ? 'default' : 
            value === 'failed' ? 'destructive' : 'secondary'
        } className={value === 'completed' ? 'bg-green-100 text-green-800' : ''}>
            <StatusIcon status={value as OtaSession['status']} />
            <span className='ml-2'>{value}</span>
        </Badge>
      )
    }

    return String(value);
  };

  const fields: (keyof OtaSession)[] = ['deviceName', 'status', 'appVersion', 'startedAt', 'endedAt', 'errorCode'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Filter sessions..." 
            className="pl-10"
            value={filter}
            onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {fields.map((field) => (
                    <TableHead key={String(field)}>
                      <Button variant="ghost" onClick={() => handleSort(field)} className="-ml-4">
                        {String(field).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <TableRow key={i}>
                            {fields.map((field) => (
                                <TableCell key={String(field)}><Skeleton className="h-5 w-full" /></TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow key={item.id} onClick={() => router.push(`/dashboard/sessions/${item.id}`)} className="cursor-pointer">
                      {fields.map((field) => (
                        <TableCell key={String(field)}>
                          {formatCell(item, field)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={fields.length} className="h-24 text-center">
                      No sessions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {currentPage} of {totalPages}
        </p>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
