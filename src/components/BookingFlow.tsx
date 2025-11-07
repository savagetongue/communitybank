import { useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createBooking } from '@/lib/mockApi';
import { toast } from 'sonner';
import type { Offer } from '@shared/types';
import { Clock, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
const bookingFormSchema = z.object({
  startTime: z.date({
    required_error: "A start date is required.",
  }),
  durationMinutes: z.coerce.number().int().min(15, { message: 'Duration must be at least 15 minutes.' }),
});
type BookingFormValues = z.infer<typeof bookingFormSchema>;
interface BookingFlowProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  offer: Offer | null;
}
export function BookingFlow({ isOpen, onOpenChange, offer }: BookingFlowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      durationMinutes: 60,
    },
  });
  const duration = form.watch('durationMinutes');
  const escrowAmount = useMemo(() => {
    if (!offer || !duration) return 0;
    return (offer.ratePerHour * duration) / 60;
  }, [offer, duration]);
  async function onSubmit(data: BookingFormValues) {
    if (!offer) return;
    setIsSubmitting(true);
    try {
      await createBooking({
        offerId: offer.id,
        startTime: data.startTime.toISOString(),
        durationMinutes: data.durationMinutes,
      });
      toast.success('Booking confirmed successfully!');
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to confirm booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  if (!offer) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Confirm Your Booking</DialogTitle>
          <DialogDescription>
            Schedule your session for "{offer.title}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (in minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" step="15" min="15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Rate</span>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Clock className="h-4 w-4 text-brand" />
                  <span>{offer.ratePerHour} credits / hour</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Duration</span>
                <span className="font-medium text-foreground">{duration || 0} minutes</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-lg pt-2 border-t">
                <span>Total Escrow</span>
                <div className="flex items-center gap-1.5 text-brand">
                  <Clock className="h-5 w-5" />
                  <span>{escrowAmount.toFixed(2)} credits</span>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Confirming...' : 'Confirm & Hold Credits'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}