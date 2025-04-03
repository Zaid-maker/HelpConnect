'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  skills: string[];
  rating: number | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileEditFormProps {
  initialProfile: Profile;
}

export default function ProfileEditForm({ initialProfile }: ProfileEditFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    ...initialProfile,
    bio: initialProfile.bio || '',
    location: initialProfile.location || '',
    avatar_url: initialProfile.avatar_url || '',
    skills: initialProfile.skills || [],
    rating: initialProfile.rating || null,
    is_verified: initialProfile.is_verified || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          bio: profile.bio || null,
          location: profile.location || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || 'Failed to update profile');
      }

      if (!data) {
        throw new Error('No data returned from update');
      }

      toast.success('Profile updated successfully', {
        description: 'Your profile has been updated.',
        duration: 3000,
      });

      router.push('/profile');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : 'There was an error updating your profile. Please try again.';
          
      toast.error('Failed to update profile', {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Input
            label="Full Name"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Input
            label="Username"
            name="username"
            value={profile.username}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <Textarea
          label="Bio"
          name="bio"
          value={profile.bio || ''}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about yourself..."
        />
      </div>

      <div>
        <Input
          label="Location"
          name="location"
          value={profile.location || ''}
          onChange={handleChange}
          placeholder="City, Country"
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
} 