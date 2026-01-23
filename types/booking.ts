import { ClientData } from "./client";
import { FileResponseData } from "./filesTypes";

export enum BookingStatus {
  Pending = 0,
  InProcess = 1,
  Canceled = 2,
  Completed = 3,
}

export interface BookingData {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address?: string | null;
  totalPrice?: string;
  serviceName: string;
  reason: string;
  carName?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createDate?: string;
  updateDate?: string | null;
  bookingStatus?: BookingStatus;
  bookingDate?: string | null;
  isVIP?: boolean;
  bookingCode: string;
  adultsNumber: number | null;
  nationalityName: string | null;
  isGccResident?: boolean | null;
  childrenNumber: number | null;
  entryType: string | null;
  duration: string | null;
  processTime: string | null;
  nationalityId: string;
}

export interface BookingDetailsData {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  totalPrice?: number | null | undefined;
  note?: string | null;
  serviceName: string;
  carName?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createDate?: string | null;
  updateDate?: string | null;
  serviceOptionName?: string | null;
  serviceOptionFee?: number | null;
  bookingStatus?: BookingStatus;
  bookingDate?: Date | null;
  endBookingDate?: Date | null;
  bookingCode: string;
  paymentStatus: string | null;
  paymentType: string | null;
  fileEntities?: FileResponseData[];
  serviceId: string;
  adultsNumber: number | null;
  childrenNumber: number | null;
  entryType: string | null;
  duration: string | null;
  processTime: string | null;
  isGccResident?: boolean | null;
  reason: string;
  nationalityName: string | null;
  clients: ClientData[] | null;
  securityDeposit?: string;
  nationalityId: string;

}

