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
    try {
      const savedUser = localStorage.getItem('edumarket_user');
      const savedPurchases = localStorage.getItem('edumarket_purchases');
      const savedUploads = localStorage.getItem('edumarket_uploads');

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // If we have a token, verify it's still valid
        if (parsed.token) {
          authAPI.getMe()
            .then(freshUser => {
              const merged = { ...parsed, ...freshUser, token: parsed.token };
              setUser(merged);
              localStorage.setItem('edumarket_user', JSON.stringify(merged));
              if (freshUser.purchasedNotes) {
                setPurchasedNotes(freshUser.purchasedNotes);
              }
            })
            .catch(() => {
              // Token expired or invalid — keep local data but clear token
              console.warn('Token validation failed, using cached data');
            });
        }
      }
      if (savedPurchases) setPurchasedNotes(JSON.parse(savedPurchases));
      if (savedUploads) setUploadedNotes(JSON.parse(savedUploads));
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
    setLoading(false);
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
