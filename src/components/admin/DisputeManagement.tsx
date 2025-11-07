import { useEffect, useState, useCallback } from 'react';
import type { Dispute } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
interface DisputeManagementProps {
  onViewDetails: (dispute: Dispute) => void;
}
export function DisputeManagement({ onViewDetails }: DisputeManagementProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchDisputes = useCallback(() => {
    setIsLoading(true);
    api<Dispute[]>('/api/admin/disputes')
      .then(data => setDisputes(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);
  const handleResolve = async (disputeId: string, status: 'RESOLVED' | 'REJECTED') => {
    const resolution = prompt(`Please enter a reason for this resolution (${status}):`);
    if (!resolution) return;
    try {
      await api(`/api/admin/disputes/${disputeId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ status, resolution }),
      });
      toast.success(`Dispute marked as ${status}.`);
      fetchDisputes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resolve dispute.');
    }
  };
  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Disputes</CardTitle>
        <CardDescription>Review and resolve user-submitted disputes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeleton()
            ) : disputes.length > 0 ? (
              disputes.map(dispute => (
                <TableRow key={dispute.id}>
                  <TableCell>{format(new Date(dispute.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{dispute.bookingTitle}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{dispute.memberName} vs {dispute.providerName}</TableCell>
                  <TableCell>
                    <Badge variant={dispute.status === 'OPEN' ? 'destructive' : 'secondary'}>
                      {dispute.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(dispute)}>View Details</DropdownMenuItem>
                        {dispute.status === 'OPEN' && (
                          <>
                            <DropdownMenuItem onClick={() => handleResolve(dispute.id, 'RESOLVED')}>Resolve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResolve(dispute.id, 'REJECTED')}>Reject</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No disputes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}