import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Format the date part as DD-MM-YYYY
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();

  const datePart = `${day}-${month}-${year}`;

  // Format the time part as HH:MM AM/PM
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} ${timePart}`;
}

export function formatTimeOnly(timeString: string | undefined): string {
  if (!timeString) return "";

  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds || 0);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const getMimeTypeFromFilename = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream'; // fallback
  }
};

export async function saveToken(token: string | null | undefined) {
  if (!token) {
    await SecureStore.deleteItemAsync("userAuth");
  } else {
    await SecureStore.setItemAsync("userAuth", token);
  }
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync("userAuth");
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return ""; // Handle empty string
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function separateCamelCase(str: string): string {
  if (str === "customerName") str = "applicantName";
  if (str === "serviceName") str = "serviceRequested";
  if (str === "nationalityName") str = "Applicant Nationality";
  const capitalised = capitalizeFirstLetter(str);
  return capitalised.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function convertEnumToString<T>(value: number, enumType: T) {
  return enumType[value as unknown as keyof typeof enumType];
}

export type paymentType = "Online" | "Direct";


export interface CanceledReason {
  reason: string;
}

export const allowedImageExtension = [
  "image/",
];

const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};


interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
}

export const checkNetworkConnectivity = async (): Promise<NetworkState> => {
  try {
    const state = await Network.getNetworkStateAsync();
    return {
      isConnected: state.isConnected || false,
      isInternetReachable: state.isInternetReachable || false
    };
  } catch (error) {
    console.error('Network check error:', error);
    return {
      isConnected: false,
      isInternetReachable: false
    };
  }
};