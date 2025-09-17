'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
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
import { getDevices } from '@/lib/api';
import { type Device } from '@/lib/data';
import { ArrowUpDown, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from './ui/card';

const PAGE_SIZE = 10;

export function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, startDataTransition] = useTransition();

  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<keyof Device | null>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    startDataTransition(async () => {
      setDevices([]);
      setCurrentPage(1);
      const fetchedDevices = await getDevices();
      setDevices(fetchedDevices);
    });
  }, []);

  const handleSort = (field: keyof Device) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    let filtered = devices;

    if (filter) {
      filtered = devices.filter((device) =>
        device.id.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (sortBy) {
        const copy = [...filtered];
        copy.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return copy;
    }

    return filtered;
  }, [devices, filter, sortBy, sortOrder]);


  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const fields: (keyof Device)[] = ['id'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Filter devices..." 
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
                        Device ID
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
                    <TableRow key={item.id} className="cursor-pointer">
                      {fields.map((field) => (
                        <TableCell key={String(field)}>
                          {item[field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={fields.length} className="h-24 text-center">
                      No devices found.
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
