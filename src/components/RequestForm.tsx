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
import type { Offer, ServiceRequest } from '@shared/types';
import { Clock } from 'lucide-react';
import { api } from '@/lib/api-client';
interface RequestFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  offer: Offer | null;
  onSuccess?: (requestId: string) => void;
}
export function RequestForm({ isOpen, onOpenChange, offer, onSuccess }: RequestFormProps) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer) return;
    setIsSubmitting(true);
    try {
      const response = await api<ServiceRequest>('/api/requests', {
        method: 'POST',
        body: JSON.stringify({ offerId: offer.id, note }),
      });
      toast.success('Service requested successfully!');
      setNote('');
      onSuccess?.(response.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send request.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!offer) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request Service</DialogTitle>
            <DialogDescription>
              You are about to request "{offer.title}" from {offer.providerName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between rounded-md border bg-muted p-3">
              <span className="text-sm font-medium text-muted-foreground">Rate</span>
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Clock className="h-4 w-4 text-brand" />
                <span>{offer.ratePerHour} credits / hour</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Optional Note</Label>
              <Textarea
                id="note"
                placeholder="Add a message for the provider... (e.g., specific requirements, preferred times)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Confirm Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}