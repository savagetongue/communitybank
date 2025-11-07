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
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
interface RatingFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  booking: Booking | null;
  onSuccess?: () => void;
}
export function RatingForm({ isOpen, onOpenChange, booking, onSuccess }: RatingFormProps) {
  const [comment, setComment] = useState('');
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || score === 0) {
      toast.error('Please select a rating score.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api('/api/ratings', {
        method: 'POST',
        body: JSON.stringify({ bookingId: booking.id, score, comment }),
      });
      toast.success('Thank you for your feedback!');
      resetForm();
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit rating.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetForm = () => {
    setComment('');
    setScore(0);
    setHoverScore(0);
    onOpenChange(false);
  };
  if (!booking) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Leave a Rating</DialogTitle>
            <DialogDescription>
              Rate your experience for the service: "{booking.offerTitle}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Your Rating</Label>
              <div className="flex items-center gap-1" onMouseLeave={() => setHoverScore(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setScore(star)}
                    onMouseEnter={() => setHoverScore(star)}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        'h-8 w-8 transition-colors',
                        (hoverScore || score) >= star
                          ? 'text-yellow-500 fill-yellow-400'
                          : 'text-muted-foreground/50'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Optional Comment</Label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts on the service..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || score === 0}>
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}