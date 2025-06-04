
import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth, { User, UserAdditionalInfo } from '../hooks/useAuth';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  signup: (username: string, password: string, additionalInfo?: UserAdditionalInfo) => boolean;
  logout: () => void;
  updateProfilePic: (imageUrl: string) => void;
  updateUserInfo: (info: Partial<UserAdditionalInfo>) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  
  // Enhanced logout with navigation
  const logoutWithRedirect = () => {
    auth.logout();
    navigate('/auth');
  };
  
  const authContextValue = {
    ...auth,
    logout: logoutWithRedirect
  };
  
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
