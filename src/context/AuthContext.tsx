import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  setCloudSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'error') => void;
  lastCloudSync: Date | null;
  setLastCloudSync: (date: Date | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  getIdToken: async () => null,
  cloudSyncStatus: 'idle',
  setCloudSyncStatus: () => {},
  lastCloudSync: null,
  setLastCloudSync: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastCloudSync, setLastCloudSync] = useState<Date | null>(null);

  const refreshToken = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setToken(null);
      return null;
    }
    try {
      const idToken = await currentUser.getIdToken();
      setToken(idToken);
      return idToken;
    } catch (err) {
      console.error('Error refreshing ID token:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const idToken = await refreshToken(currentUser);
        if (idToken) {
          // Sync profile to backend Cloud SQL database
          try {
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
            });
          } catch (err) {
            console.warn('Could not sync user profile to backend:', err);
          }
        }
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshToken]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      setUser(result.user);
      const idToken = await result.user.getIdToken();
      setToken(idToken);

      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error: any) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setToken(null);
      setCloudSyncStatus('idle');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      const freshToken = await auth.currentUser.getIdToken(true);
      setToken(freshToken);
      return freshToken;
    } catch {
      return token;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        signInWithGoogle,
        signOut,
        getIdToken,
        cloudSyncStatus,
        setCloudSyncStatus,
        lastCloudSync,
        setLastCloudSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
