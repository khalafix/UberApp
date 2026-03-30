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
  user: User | null; // current logged in user
  updateUser: (updatedUser: User) => Promise<void>;
  clearUser: () => Promise<void>;
  getFingerUser: () => Promise<User | null>; // fingerprint login user
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
        // 1️⃣ Try normal login user first
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          return;
        }

        // 2️⃣ If no normal user, try fingerprint user
        const storedFingerUser = await AsyncStorage.getItem("finger_user");
        if (storedFingerUser) {
          setUser(JSON.parse(storedFingerUser));
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
      // Also save for fingerprint login
      await AsyncStorage.setItem("finger_user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  // Clear user from state and AsyncStorage (logout)
  const clearUser = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem("user");
      // Do NOT remove "finger_user" so fingerprint login can still work
    } catch (error) {
      console.error("Failed to clear user:", error);
    }
  };

  // Get fingerprint login user
  const getFingerUser = async (): Promise<User | null> => {
    try {
      const storedFingerUser = await AsyncStorage.getItem("finger_user");
      if (storedFingerUser) {
        return JSON.parse(storedFingerUser);
      }
      return null;
    } catch (error) {
      console.error("Failed to get fingerprint user:", error);
      return null;
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser, getFingerUser }}>
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