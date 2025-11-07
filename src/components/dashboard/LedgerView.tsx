import { useEffect, useState } from 'react';
import { getLedgerByUserId } from '@/lib/mockApi';
import type { LedgerEntry } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
export function LedgerView() {
  const [ledger, setLedger] = useState<{ entries: LedgerEntry[], balance: number }>({ entries: [], balance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getLedgerByUserId('user-demo')
      .then(data => {
        setLedger(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);
  const renderSkeleton = () => (
    <TableRow>
      <TableCell colSpan={4}>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </TableCell>
    </TableRow>
  );
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Time Ledger</CardTitle>
            <CardDescription>Your complete transaction history.</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold flex items-center justify-end gap-1">
              <Clock className="h-5 w-5 text-brand" />
              {isLoading ? <Skeleton className="h-6 w-16" /> : <span>{ledger.balance.toFixed(2)}</span>}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeleton()
            ) : ledger.entries.length > 0 ? (
              ledger.entries.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <p className="font-medium">{entry.txnType}</p>
                    <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-mono",
                    entry.amount > 0 ? 'text-green-600' : 'text-destructive'
                  )}>
                    {entry.amount > 0 ? `+${entry.amount.toFixed(2)}` : entry.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono hidden sm:table-cell">{entry.balanceAfter.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}