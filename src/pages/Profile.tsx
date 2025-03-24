/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  address: string;
  medical_history: string;
  allergies: string[];
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is expected for new users
        throw error;
      }

      // If no profile exists, create an empty one
      if (!data) {
        setProfile({
          id: user!.id,
          full_name: '',
          phone: '',
          date_of_birth: '',
          address: '',
          medical_history: '',
          allergies: [],
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      toast.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      
      // Ensure all fields are properly formatted
      const formattedProfile = {
        ...profile,
        allergies: Array.isArray(profile.allergies) 
          ? profile.allergies 
          : profile.allergies?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .upsert(formattedProfile, {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

      if (error) throw error;
      toast.success('Profile updated successfully');
      
      // Refresh profile data
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile?.full_name || ''}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev!,
                  full_name: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={profile?.phone || ''}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev!, phone: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={profile?.date_of_birth || ''}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev!,
                  date_of_birth: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profile?.address || ''}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev!, address: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="medical_history">Medical History</Label>
            <Textarea
              id="medical_history"
              value={profile?.medical_history || ''}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev!,
                  medical_history: e.target.value,
                }))
              }
              rows={4}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              value={Array.isArray(profile?.allergies) ? profile?.allergies.join(', ') : ''}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev!,
                  allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                }))
              }
              placeholder="Enter allergies separated by commas"
            />
          </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}