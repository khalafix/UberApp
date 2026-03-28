// app/usercontext/UserContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

// Define a type for your user object
export interface User {
  username: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  avatarUpdatedAt?: number;
}

// Define the context type
interface UserContextType {
  user: User | null;
  updateUser: (updatedUser: User) => Promise<void>;
  clearUser: () => Promise<void>;
}

// Props for the provider
interface UserProviderProps {
  children: ReactNode;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from AsyncStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  // Update user and persist it
  const updateUser = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  // Clear user from state and AsyncStorage (logout)
  const clearUser = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Failed to clear user:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};