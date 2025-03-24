/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Prescription } from '@/lib/types';
import { useAuth } from './useAuth';

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    } else {
      setPrescriptions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error:any) {
      toast.error('Error fetching prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const uploadPrescription = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('prescriptions')
        .insert({
          user_id: user?.id,
          file_url: publicUrl,
          status: 'pending',
        });

      if (dbError) throw dbError;

      toast.success('Prescription uploaded successfully');
      await fetchPrescriptions();
    } catch (error) {
      toast.error('Error uploading prescription');
    }
  };

  return {
    prescriptions,
    loading,
    uploadPrescription,
  };
}