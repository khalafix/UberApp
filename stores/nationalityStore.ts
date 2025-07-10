
import agent from "@/app/api/agent";
import { NationalityData } from "@/types/nationality";
import { makeAutoObservable, runInAction } from "mobx";
export default class NationalityStore {
  NationalitiesDropdown: NationalityData[] | null = null;
  currentNationality: NationalityData | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadNationalities = async () => {
    try {
      const response = await agent.Nationality.getAll();
      runInAction(() => {
        this.NationalitiesDropdown = response;
      });
    } catch (error) {
      console.error("Error loading Nationalities : ", error);
    }
  };

  // getNatinality = async (id: string) => {
  //   try {
  //     const result = await agent.Nationality.getById(id);
  //     runInAction(() => {
  //       this.currentNationality = result;
  //     });
  //     return this.currentNationality;
  //   } catch (error) {
  //     console.error("Error fetching nationality:", error);
  //   }
  // };
}