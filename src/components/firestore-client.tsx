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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCollection } from '@/lib/api';
import { type User, type Product } from '@/lib/data';
import {
  ArrowUpDown,
  BrainCircuit,
  Loader2,
  Search,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { dataSummaryForManagers } from '@/ai/flows/data-summary-for-managers';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type CollectionName = 'users' | 'products';
type DataItem = User | Product;

const collectionFields: Record<CollectionName, (keyof DataItem)[]> = {
  users: ['id', 'name', 'email', 'role', 'status', 'lastLogin'],
  products: ['id', 'name', 'category', 'price', 'stock', 'createdAt'],
};

const PAGE_SIZE = 5;

export function FirestoreClient() {
  const [collection, setCollection] = useState<CollectionName>('users');
  const [data, setData] = useState<DataItem[]>([]);
  const [isLoading, startDataTransition] = useTransition();
  const [isSummarizing, startSummaryTransition] = useTransition();

  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<keyof DataItem | null>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);


  useEffect(() => {
    startDataTransition(async () => {
      setData([]);
      setCurrentPage(1);
      const fetchedData = await getCollection(collection);
      setData(fetchedData as DataItem[]);
    });
  }, [collection]);
  
  const handleSort = (field: keyof DataItem) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    let filtered = data;

    if (filter) {
      filtered = data.filter((item) =>
        Object.values(item).some((value) =>
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
            
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return filtered;
  }, [data, filter, sortBy, sortOrder]);


  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const formatCell = (item: DataItem, field: keyof DataItem) => {
    const value = item[field as keyof typeof item];
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (field === 'price') {
      return `$${Number(value).toFixed(2)}`;
    }
    if (field === 'status' && typeof value === 'string') {
        return <Badge variant={value === 'active' ? 'default' : 'secondary'} className={value === 'active' ? 'bg-green-500/20 text-green-700 border-green-500/30' : ''}>{value}</Badge>
    }
    if (field === 'role' && typeof value === 'string') {
        return <Badge variant="outline">{value}</Badge>
    }
    return String(value);
  };

  const handleSummarize = () => {
    startSummaryTransition(async () => {
      setSummary(null);
      setSummaryError(null);
      try {
        const result = await dataSummaryForManagers({ collectionName: collection });
        setSummary(result.summary);
      } catch (e) {
        console.error(e);
        setSummaryError('An error occurred while generating the summary. Please try again.');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Filter records..." 
            className="pl-10"
            value={filter}
            onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
            }}
          />
        </div>
        <Select value={collection} onValueChange={(value) => setCollection(value as CollectionName)}>
          <SelectTrigger className="w-full md:w-auto">
            <SelectValue placeholder="Select a collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="users">Users</SelectItem>
            <SelectItem value="products">Products</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSummarize} disabled={isSummarizing || isLoading} className="w-full md:w-auto md:justify-self-end bg-accent hover:bg-accent/90">
            {isSummarizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            Get AI Summary
        </Button>
      </div>

      {(isSummarizing || summary || summaryError) && (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <BrainCircuit className="size-5 text-accent"/>
                    Data Summary for "{collection}"
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isSummarizing && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
                {summary && <p className="text-muted-foreground">{summary}</p>}
                {summaryError && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{summaryError}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {collectionFields[collection].map((field) => (
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
                            {collectionFields[collection].map((field) => (
                                <TableCell key={String(field)}><Skeleton className="h-5 w-full" /></TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      {collectionFields[collection].map((field) => (
                        <TableCell key={String(field)}>
                          {formatCell(item, field)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={collectionFields[collection].length} className="h-24 text-center">
                      No results found.
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
