import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface UserAdditionalInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  cityState?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  profilePic?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Initialize the users array with a default user if it doesn't exist
  const initializeUsers = () => {
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
      const defaultUser = {
        id: '1',
        username: 'admin',
        password: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User'
      };
      
      localStorage.setItem('users', JSON.stringify([defaultUser]));
    }
  };

  useEffect(() => {
    // Set initial loading state
    setIsLoading(true);
    
    // Initialize users array with default user
    initializeUsers();
    
    try {
      const storedUser = localStorage.getItem('currentUser');
      
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // In case of error, ensure we don't keep user data
      localStorage.removeItem('currentUser');
    } finally {
      // Always set loading to false, even if there was an error
      setIsLoading(false);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.username === username && u.password === password);
      
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };

  const signup = (username: string, password: string, additionalInfo?: UserAdditionalInfo): boolean => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.some((u: User) => u.username === username)) {
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        profilePic: '',
        ...additionalInfo
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      return true;
    } catch (error) {
      console.error("Error during signup:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/auth');
  };

  const updateProfilePic = (imageUrl: string) => {
    if (currentUser) {
      try {
        const updatedUser = { ...currentUser, profilePic: imageUrl };
        
        // Update in state
        setCurrentUser(updatedUser);
        
        // Update in localStorage for currentUser
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update in the users array in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map((u: User) => 
          u.id === currentUser.id ? updatedUser : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      } catch (error) {
        console.error("Error updating profile picture:", error);
      }
    }
  };
  
  const updateUserInfo = (info: Partial<UserAdditionalInfo>) => {
    if (currentUser) {
      try {
        const updatedUser = { ...currentUser, ...info };
        
        // Update in state
        setCurrentUser(updatedUser);
        
        // Update in localStorage for currentUser
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update in the users array in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map((u: User) => 
          u.id === currentUser.id ? updatedUser : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        return true;
      } catch (error) {
        console.error("Error updating user information:", error);
        return false;
      }
    }
    return false;
  };

  return { 
    currentUser, 
    isLoading, 
    login, 
    signup, 
    logout, 
    updateProfilePic,
    updateUserInfo 
  };
};

export default useAuth;
