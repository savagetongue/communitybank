import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Booking } from '@shared/types';
import { api } from '@/lib/api-client';
interface DisputeFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  booking: Booking | null;
  onSuccess?: () => void;
}
export function DisputeForm({ isOpen, onOpenChange, booking, onSuccess }: DisputeFormProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !reason.trim()) {
      toast.error('Please provide a reason for the dispute.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api('/api/disputes', {
        method: 'POST',
        body: JSON.stringify({ bookingId: booking.id, reason }),
      });
      toast.success('Dispute submitted successfully. An admin will review it shortly.');
      resetForm();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit dispute.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetForm = () => {
    setReason('');
    onOpenChange(false);
  };
  if (!booking) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Open a Dispute</DialogTitle>
            <DialogDescription>
              Describe the issue with the service: "{booking.offerTitle}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Dispute</Label>
              <Textarea
                id="reason"
                placeholder="Please be as detailed as possible..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting || !reason.trim()}>
              {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}