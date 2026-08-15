import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferences?: {
    marketingEmails: boolean;
    orderNotifications: boolean;
  };
  createdAt: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) { console.error(error); return null; }
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? undefined,
    preferences: {
      marketingEmails: data.marketing_emails,
      orderNotifications: data.order_notifications,
    },
    createdAt: data.created_at,
  };
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>
): Promise<UserProfile | null> => {
  const payload: { name?: string; phone?: string; marketing_emails?: boolean; order_notifications?: boolean } = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.preferences) {
    payload.marketing_emails = updates.preferences.marketingEmails;
    payload.order_notifications = updates.preferences.orderNotifications;
  }
  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  if (error) { toast.error(error.message); return null; }
  return getUserProfile(userId);
};

export const isCurrentUserAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();
  if (error) { console.error(error); return false; }
  return !!data;
};
