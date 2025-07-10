import agent from "@/app/api/agent";
import { ServiceData } from "@/types/service";
import { makeAutoObservable, runInAction } from "mobx";



export default class ServiceStore {
 
  services: ServiceData[] | null | undefined = null;
  currentService: ServiceData | null = null;
  searchTerm?: string = "";
  categoryAllId?: string = "";
  categoryId?: string = "";
  fromDate: string = "";
  toDate: string = "";
  userId: string = "";
  static visitVisaServices: any;

  constructor() {
    makeAutoObservable(this);
  }

  getService = async (id: string) => {
    try {
      const result = await agent.Services.getById(id);

      // Run in action to update state
      runInAction(() => {
        this.currentService = result
      });

      // Return the updated currentService after it's set in state
      return this.currentService;
    } catch (error) {
      console.error("Error loading service:", error);
      return null; // Return null on error, just like in getBooking
    }
  };
}