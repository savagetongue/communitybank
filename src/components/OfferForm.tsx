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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addOffer } from '@/lib/mockApi';
import { toast } from 'sonner';
import { useState } from 'react';
const offerFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters long.' }),
  skills: z.string().min(1, { message: 'Please list at least one skill.' }),
  ratePerHour: z.coerce.number().positive({ message: 'Rate must be a positive number.' }),
});
type OfferFormValues = z.infer<typeof offerFormSchema>;
interface OfferFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onOfferCreated?: () => void; // Optional callback to refresh list
}
export function OfferForm({ isOpen, onOpenChange, onOfferCreated }: OfferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: '',
      description: '',
      skills: '',
      ratePerHour: 1,
    },
  });
  async function onSubmit(data: OfferFormValues) {
    setIsSubmitting(true);
    const offerData = {
      ...data,
      skills: data.skills.split(',').map(s => s.trim()),
    };
    try {
      await addOffer(offerData);
      toast.success('Offer created successfully!');
      onOfferCreated?.();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to create offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create a New Offer</DialogTitle>
          <DialogDescription>
            Fill out the details of the service you want to provide to the community.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Custom Logo Design" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your service in detail..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React, TypeScript, Branding" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter skills separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ratePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate (credits per hour)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.25" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Offer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}