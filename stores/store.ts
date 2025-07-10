import { createContext, useContext } from "react";
import BookingStore from "./bookingStore";
import NationalityStore from "./nationalityStore";
import ServiceStore from "./serviceStore";
import UserStore from "./userStore";
interface Store {
  nationalityStore:NationalityStore;
  serviceStore : ServiceStore;
  bookingStore : BookingStore;
  userStore: UserStore;
}

export const store: Store = {
  nationalityStore:new NationalityStore(),
  serviceStore:new ServiceStore(),
  bookingStore:new BookingStore(),
  userStore:new UserStore(),
};

export const StoreContext = createContext(store);
export function useStore() {
return useContext(StoreContext);
}