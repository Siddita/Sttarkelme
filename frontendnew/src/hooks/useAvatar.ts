import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getMeV1ProfilesMeGet } from './useApis';

/**
 * Custom hook to get the user's avatar URL from multiple sources
 * Priority: API profile data > localStorage > fallback image
 * This ensures the avatar shows everywhere in the app consistently
 */
export function useAvatar() {
  const qc = useQueryClient();
  
  // Use the query hook to ensure data is fetched and reactive
  const { data: profileData } = getMeV1ProfilesMeGet({
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  
  const avatarUrl = useMemo(() => {
    // Priority order:
    // 1. API profile data avatar_url (from query)
    if (profileData && typeof profileData === 'object') {
      const apiAvatar = (profileData as any)?.avatar_url;
      if (apiAvatar && typeof apiAvatar === 'string' && apiAvatar.trim() !== '') {
        return apiAvatar;
      }
    }
    
    // 2. Try React Query cache as fallback
    const cachedProfile = qc.getQueryData(['get_me_v1_profiles_me_get']) as any;
    if (cachedProfile?.avatar_url && typeof cachedProfile.avatar_url === 'string' && cachedProfile.avatar_url.trim() !== '') {
      return cachedProfile.avatar_url;
    }
    
    // 3. localStorage (for uploaded avatars that persist across refreshes)
    if (typeof window !== 'undefined') {
      const storedAvatar = localStorage.getItem('user_avatar_url');
      if (storedAvatar && storedAvatar.trim() !== '') {
        return storedAvatar;
      }
    }
    
    // 4. Fallback to default image
    return "/professional-headshot.png";
  }, [profileData, qc]);
  
  return avatarUrl;
}

