import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ProfileType = 'pf' | 'pj';

interface ProfileContextType {
  activeProfile: ProfileType;
  setActiveProfile: (profile: ProfileType) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<ProfileType>('pf');

  return (
    <ProfileContext.Provider value={{
      activeProfile,
      setActiveProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}