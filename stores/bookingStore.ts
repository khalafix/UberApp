import agent from "@/app/api/agent";
import { ActionResult } from "@/types";
import { BookingData, BookingDetailsData, BookingStatus } from "@/types/booking";
import { makeAutoObservable, runInAction } from "mobx";
import { BookingSchema } from "../lib/schemas/bookingSchema";
import { DocumentBookingSchema } from "../lib/schemas/documentBookingSchema";
import { convertEnumToString, formatDateTime } from "../lib/schemas/utils";


export default class BookingStore {
  bookings: BookingData[] | null | undefined = null;
  currentBooking: BookingDetailsData | null = null;
  loadingInitial = false;
  availableSlots: string[] | null = null;

  // New filter parameters
  searchTerm: string | null = null;
  bookingStatus: string | null = null;
  fromDate: string | null = null;
  toDate: string | null = null;
  serviceId: string | null = null;
  isSession: string[] | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Add Booking
  addBooking = async (
    booking: BookingSchema | DocumentBookingSchema
  ): Promise<ActionResult<string>> => {
    try {
      const response = await agent.Bookings.create(booking);
      runInAction(() => {
        this.bookings = this.bookings
          ? [...this.bookings, response]
          : [response];
      });
      return { status: "success", data: response.id };
    } catch (error) {
      console.error("Error adding booking: ", error);
      return { status: "error", error: error as string };
    }
  };

  // Get Booking by ID
  getBooking = async (id: string) => {
    try {
      const result = await agent.Bookings.getById(id);

      runInAction(() => {
        this.currentBooking = {
          ...result,
          bookingStatus: convertEnumToString(
            Number(result.bookingStatus),
            BookingStatus
          ),
        };
      });
      return this.currentBooking;
    } catch (error) {
      console.error("Error fetching booking: ", error);
      return null;
    }
  };

  // Get Available Slots
  getAvailableSlots = async (date: string): Promise<ActionResult<string>> => {
    try {
      const result = await agent.Bookings.getAvailableSlots(date);
      runInAction(() => {
        this.availableSlots = result;
      });
      return {
        status: "success",
        data: "Received available slots successfully",
      };
    } catch (error) {
      runInAction(() => {
        this.availableSlots = null;
      });
      console.error("Error loading available slots: ", error);
      return { status: "error", error: error as string };
    }
  };


getBookingByCustomerId = async (id: string) => {
    const bookingList: BookingData[] = [];
    try {
      const result = await agent.Bookings.getBookingByCustomerId(id);
      runInAction(() => {
        

        result.map((item) => {
          bookingList.push({
            ...item,
            updateDate: item.updateDate
              ? formatDateTime(item.updateDate)
              : "No set",
            createDate: formatDateTime(item.createDate),
            updatedBy: item.updatedBy ? item.updatedBy : "No set",
            bookingDate: formatDateTime(item.bookingDate?.toString()),
            totalPrice: item.totalPrice + " AED",
            bookingStatus: convertEnumToString(
              Number(item.bookingStatus),
              BookingStatus
            ),
          });
        });

        this.bookings = bookingList;
        
      });
      this.loadingInitial = false;
      return bookingList;
    } catch (error) {
      console.error("Error loading bookings: ", error);
      this.loadingInitial = false;
    }
  };

  
  getBookingByEmail = async (email: string) => {
    const bookingList: BookingData[] = [];
    try {
      const result = await agent.Bookings.getBookingByEmail(email);
      runInAction(() => {
        

        result.map((item) => {
          bookingList.push({
            ...item,
            updateDate: item.updateDate
              ? formatDateTime(item.updateDate)
              : "No set",
            createDate: formatDateTime(item.createDate),
            updatedBy: item.updatedBy ? item.updatedBy : "No set",
            bookingDate: formatDateTime(item.bookingDate?.toString()),
            totalPrice: item.totalPrice + " AED",
            bookingStatus: convertEnumToString(
              Number(item.bookingStatus),
              BookingStatus
            ),
          });
        });

        this.bookings = bookingList;
        
      });
      this.loadingInitial = false;
      return bookingList;
    } catch (error) {
      console.error("Error loading bookings: ", error);
      this.loadingInitial = false;
    }
  };


  uploadImage = async (formData: FormData): Promise<ActionResult<string>> => {
    try {
      await agent.Bookings.uploadImage(formData);
      return { status: "success", data: "Documents Uploaded Successfully" };
    } catch (error:any) {
      console.error("Error uploading Documents: ", error);
      return { status: "error", error: error as string };
    }
  };

    clearBookings = () => {
    this.bookings = null;
  };
 
}
