import { Key } from "react";

export type FileResponseData = {
  id: string;
  fileName?: string;
  filePath?: string;
  contentType?: string;
  size: number;
  createDate?: string;
  updateDate?: string;
  createdBy?: string;
  updatedBy?: string;
};

export type FileFormInputs = {
  file: FileList; 
  directory: string;
  entityId: string;
  number?:string|null|Key;
}

