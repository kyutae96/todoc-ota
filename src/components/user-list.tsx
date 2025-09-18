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
import { getUsers, updateUserRole } from '@/lib/api';
import { type User, type Role } from '@/lib/data';
import { ArrowUpDown, Search, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PAGE_SIZE = 10;

const roleDescriptions: Record<Role, string> = {
    admin: 'Full access to all features, including user management and storage deletion.',
    manager: 'Can view devices and sessions, and browse storage, but cannot manage users or delete files.',
    unauthorized: 'No access to any dashboard features. Account is pending administrator approval.',
};

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, startDataTransition] = useTransition();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<keyof User | null>('email');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = () => {
    startDataTransition(async () => {
      setUsers([]);
      setCurrentPage(1);
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (uid: string, newRole: Role) => {
    try {
      await updateUserRole(uid, newRole);
      // Optimistically update UI
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      toast({
        title: "Role Updated",
        description: `User role has been successfully changed to ${newRole}.`,
      });
    } catch (error) {
      console.error("Failed to update role:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the user's role.",
      });
    }
  };

  const handleSort = (field: keyof User) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    let filtered = users;
    if (filter) {
      filtered = users.filter((user) =>
        Object.values(user).some(val => 
            String(val).toLowerCase().includes(filter.toLowerCase())
        )
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
  }, [users, filter, sortBy, sortOrder]);


  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const fields: { key: keyof User, label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'organization', label: 'Organization' },
    { key: 'role', label: 'Role' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Filter by name, email, role..." 
            className="pl-10"
            value={filter}
            onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
            }}
          />
        </div>
         <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {fields.map((field) => (
                    <TableHead key={field.key}>
                      <Button variant="ghost" onClick={() => handleSort(field.key)} className="-ml-4">
                        {field.label}
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
                                <TableCell key={field.key}><Skeleton className="h-5 w-full" /></TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.organization || 'N/A'}</TableCell>
                      <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user.uid, newRole as Role)}
                            disabled={user.uid === currentUser?.uid}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(roleDescriptions) as Role[]).map(role => (
                                    <SelectItem key={role} value={role}>
                                      {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={fields.length} className="h-24 text-center">
                      No users found.
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
