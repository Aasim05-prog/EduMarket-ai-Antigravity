import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, notesAPI } from './api';
import { disconnectSocket } from './socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasedNotes, setPurchasedNotes] = useState([]);
  const [uploadedNotes, setUploadedNotes] = useState([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('edumarket_user');
        const savedPurchases = localStorage.getItem('edumarket_purchases');
        const savedUploads = localStorage.getItem('edumarket_uploads');

        if (savedPurchases) setPurchasedNotes(JSON.parse(savedPurchases));
        if (savedUploads) setUploadedNotes(JSON.parse(savedUploads));

        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);

          // If we have a token, verify it's still valid
          if (parsed.token) {
            try {
              const freshUser = await authAPI.getMe();
              const merged = { ...parsed, ...freshUser, token: parsed.token };
              setUser(merged);
              localStorage.setItem('edumarket_user', JSON.stringify(merged));
              if (freshUser.purchasedNotes) {
                setPurchasedNotes(freshUser.purchasedNotes);
              }
            } catch (err) {
              // Distinguish auth errors from network errors
              const isAuthError = err.message?.includes('Not authorized') || 
                                  err.message?.includes('token failed') ||
                                  err.message?.includes('token expired');
              if (isAuthError) {
                // Token is invalid/expired — clear session so user can re-login
                console.warn('Token expired or invalid, clearing session');
                setUser(null);
                localStorage.removeItem('edumarket_user');
                localStorage.removeItem('edumarket_purchases');
                localStorage.removeItem('edumarket_uploads');
                disconnectSocket();
              } else {
                // Network error (backend down) — keep cached data
                console.warn('Token validation failed (network), using cached data');
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Persist user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('edumarket_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('edumarket_purchases', JSON.stringify(purchasedNotes));
  }, [purchasedNotes]);

  useEffect(() => {
    localStorage.setItem('edumarket_uploads', JSON.stringify(uploadedNotes));
  }, [uploadedNotes]);

  const register = async ({ fullName, username, email, password, educationLevel }) => {
    try {
      const data = await authAPI.register({ fullName, username, email, password, educationLevel });
      const userData = {
        ...data,
        id: data._id,
        joinedDate: data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        isOnline: true,
      };
      setUser(userData);
      localStorage.setItem('edumarket_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const data = await authAPI.login({ email, password });
      const userData = {
        ...data,
        id: data._id,
        joinedDate: data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        isOnline: true,
      };
      setUser(userData);
      localStorage.setItem('edumarket_user', JSON.stringify(userData));
      if (data.purchasedNotes) {
        setPurchasedNotes(data.purchasedNotes);
      }
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setPurchasedNotes([]);
    setUploadedNotes([]);
    localStorage.removeItem('edumarket_user');
    localStorage.removeItem('edumarket_purchases');
    localStorage.removeItem('edumarket_uploads');
    disconnectSocket();
  };

  const updateProfile = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('edumarket_user', JSON.stringify(updated));
      return updated;
    });
  };

  const purchaseNote = async (noteId) => {
    // Try API call first
    try {
      await notesAPI.purchase(noteId);
    } catch (err) {
      console.warn('API purchase failed, saving locally:', err.message);
    }
    // Always update local state
    if (!purchasedNotes.includes(noteId)) {
      setPurchasedNotes(prev => [...prev, noteId]);
    }
  };

  const isNotePurchased = (noteId) => {
    return purchasedNotes.includes(noteId) || purchasedNotes.includes(String(noteId));
  };

  const addUploadedNote = (note) => {
    setUploadedNotes(prev => [...prev, note]);
    setUser(prev => ({
      ...prev,
      notesUploaded: (prev.notesUploaded || 0) + 1,
    }));
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    purchaseNote,
    isNotePurchased,
    purchasedNotes,
    uploadedNotes,
    addUploadedNote,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
