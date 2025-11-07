import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
export function LedgerAdjustments() {
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || amount === 0 || !reason) {
      toast.error('All fields are required.');
      return;
    }
    setIsLoading(true);
    try {
      await api('/api/admin/ledger-adjust', {
        method: 'POST',
        body: JSON.stringify({ memberId, amount, reason }),
      });
      toast.success('Ledger adjusted successfully!');
      setMemberId('');
      setAmount(0);
      setReason('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to adjust ledger.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Ledger Adjustment</CardTitle>
        <CardDescription>
          Credit or debit a member's account. Use positive values to add credits and negative values to remove them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="memberId">Member ID</Label>
            <Input id="memberId" value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="user-..." disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Dispute resolution refund, bonus credits..." disabled={isLoading} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Adjustment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}