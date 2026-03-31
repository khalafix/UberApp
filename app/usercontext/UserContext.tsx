// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

// // Define a type for your user object
// export interface User {
//   username: string;
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   avatar?: string | null;
//   avatarUpdatedAt?: number;
// }

// // Define the context type
// interface UserContextType {
//   user: User | null;
//   updateUser: (updatedUser: User) => Promise<void>;
//   clearUser: () => Promise<void>;
//   getFingerUser: () => Promise<User | null>;
// }

// interface UserProviderProps {
//   children: ReactNode;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);

//   // Load user only if not logged out
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const loggedOut = await AsyncStorage.getItem("logged_out");
//         if (loggedOut === "true") {
//           // User logged out previously, keep null
//           setUser(null);
//           return;
//         }

//         // Try normal login user first
//         const storedUser = await AsyncStorage.getItem("user");
//         if (storedUser) {
//           setUser(JSON.parse(storedUser));
//           return;
//         }

//         // Optionally, try fingerprint user (if you want)
//         // const storedFingerUser = await AsyncStorage.getItem("finger_user");
//         // if (storedFingerUser) setUser(JSON.parse(storedFingerUser));

//       } catch (error) {
//         console.error("Failed to load user:", error);
//       }
//     };
//     loadUser();
//   }, []);

//   // Update user and persist it
//   const updateUser = async (updatedUser: User) => {
//     try {
//       setUser(updatedUser);
//       await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
//       await AsyncStorage.setItem("finger_user", JSON.stringify(updatedUser));
//       await AsyncStorage.setItem("logged_out", "false"); // reset logout flag
//     } catch (error) {
//       console.error("Failed to save user:", error);
//     }
//   };

//   // Clear user (logout)
//   const clearUser = async () => {
//     try {
//       setUser(null);
//       await AsyncStorage.removeItem("user");
//       await AsyncStorage.setItem("logged_out", "true"); // mark as logged out
//       // keep "finger_user" if you want fingerprint login later
//     } catch (error) {
//       console.error("Failed to clear user:", error);
//     }
//   };

//   const getFingerUser = async (): Promise<User | null> => {
//     try {
//       const storedFingerUser = await AsyncStorage.getItem("finger_user");
//       if (storedFingerUser) return JSON.parse(storedFingerUser);
//       return null;
//     } catch (error) {
//       console.error("Failed to get fingerprint user:", error);
//       return null;
//     }
//   };

//   return (
//     <UserContext.Provider value={{ user, updateUser, clearUser, getFingerUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) throw new Error("useUser must be used within a UserProvider");
//   return context;
// };

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

// Define an Address type
export interface Address {
  index: number;
  country: string;
  city: string;
  fullAddress: string;
  state: string;
  zip: string;
}

// Define a type for your user object
export interface User {
  username: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  avatarUpdatedAt?: number;
  addresses?: Address[]; // <-- added addresses
}

// Define the context type
interface UserContextType {
  user: User | null;
  updateUser: (updatedUser: User) => Promise<void>;
  clearUser: () => Promise<void>;
  getFingerUser: () => Promise<User | null>;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user only if not logged out
  useEffect(() => {
    const loadUser = async () => {
      try {
        const loggedOut = await AsyncStorage.getItem("logged_out");
        if (loggedOut === "true") {
          setUser(null);
          return;
        }

        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          return;
        }

        // Optionally, try fingerprint user
        // const storedFingerUser = await AsyncStorage.getItem("finger_user");
        // if (storedFingerUser) setUser(JSON.parse(storedFingerUser));

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
      await AsyncStorage.setItem("finger_user", JSON.stringify(updatedUser));
      await AsyncStorage.setItem("logged_out", "false");
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  // Clear user (logout)
  const clearUser = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem("user");
      await AsyncStorage.setItem("logged_out", "true");
    } catch (error) {
      console.error("Failed to clear user:", error);
    }
  };

  const getFingerUser = async (): Promise<User | null> => {
    try {
      const storedFingerUser = await AsyncStorage.getItem("finger_user");
      if (storedFingerUser) return JSON.parse(storedFingerUser);
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

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};