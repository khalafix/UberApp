import { FileResponseData } from "./filesTypes";

export enum clientStatus {
  Pending = 0,
  InProcess = 1,
  Accepted = 2,
  Rejected = 3,
}

export interface ClientData {
  id: string;
  name: string;
  passportNumber: string;
  fileEntities?: FileResponseData[];
  bookingCode: string | null;
  status: clientStatus;
  createDate?: string | null;
  updateDate?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}
