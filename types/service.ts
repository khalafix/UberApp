import { FileResponseData } from "./filesTypes";

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  price: string;
  childPrice?: string|null;
  expressPrice?: string|null;
  regularPrice?: string|null;
  rate: number;
  priceVIP?: string;
  serviceVipName?: string;
  totalPrice?: string;
  fileEntities?: FileResponseData[];
  createDate?: string;
  updateDate?: string;
  createdBy?: string;
  updatedBy?: string;
  categoryId?: string;
  categoryName?: string;
  serviceOptions?: ServiceOptionData[];
  isRequiredFiles?:boolean|null;
  requiredFiles?:string[];
}

export interface ServiceOptionData {
  id: string;
  name: string;
  description?: string; 
  additionalFee: number;
}
