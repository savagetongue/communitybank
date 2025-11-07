import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Dispute } from '@shared/types';
import { format } from 'date-fns';
interface DisputeDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  dispute: Dispute | null;
}
export function DisputeDetailsModal({ isOpen, onOpenChange, dispute }: DisputeDetailsModalProps) {
  if (!dispute) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dispute Details</DialogTitle>
          <DialogDescription>
            Reviewing dispute for booking: "{dispute.bookingTitle}"
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={dispute.status === 'OPEN' ? 'destructive' : 'secondary'}>
              {dispute.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Date Filed</span>
            <span className="text-sm font-medium">{format(new Date(dispute.createdAt), 'PPP')}</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Parties Involved</h4>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{dispute.memberName}</span> (Member) vs. <span className="font-medium text-foreground">{dispute.providerName}</span> (Provider)
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Reason for Dispute</h4>
            <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{dispute.reason}</p>
          </div>
          {dispute.status !== 'OPEN' && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Admin Resolution</h4>
              <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{dispute.resolution}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}