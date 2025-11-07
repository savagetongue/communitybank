import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { Member } from '@shared/types';
export function ProfileSettings() {
  const user = useAuthStore(s => s.user);
  const login = useAuthStore(s => s.login); // To update user state after save
  const token = useAuthStore(s => s.token);
  const [name, setName] = useState(user?.name || '');
  const [contact, setContact] = useState(user?.contact || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setName(user?.name || '');
    setContact(user?.contact || '');
    setBio(user?.bio || '');
  }, [user]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedMember = await api<Member>('/api/me', {
        method: 'PUT',
        body: JSON.stringify({ name, contact, bio }),
      });
      // Update the user state in zustand store
      if (token) {
        login({ member: updatedMember, token });
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your personal information here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user?.email} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Info (Optional)</Label>
            <Input id="contact" placeholder="e.g., your Discord username or phone number" value={contact} onChange={(e) => setContact(e.target.value)} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell the community a little about yourself and your skills."
              className="min-h-[100px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}