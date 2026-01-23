import { BookingSchema } from "@/lib/schemas/bookingSchema";
import { DocumentBookingSchema } from "@/lib/schemas/documentBookingSchema";
import { LoginSchema, RegisterForUpdateSchema, RegisterSchema, RegisterSchemaForEmail } from "@/lib/schemas/loginSchema";
import { ResortsSchema } from "@/lib/schemas/resortsSchema";
import { paymentType } from "@/lib/schemas/utils";
import { store } from "@/stores/store";
import { BookingData, BookingDetailsData } from "@/types/booking";
import { NationalityData } from "@/types/nationality";
import { ServiceData } from "@/types/service";
import { User, UserIdAndName } from "@/types/user";
import axios, { AxiosError, AxiosResponse } from "axios";
import { PUBLIC_API_URL } from "../environment";



axios.defaults.baseURL = PUBLIC_API_URL;

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

axios.interceptors.request.use(
  (config) => {
    const token = store.userStore.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    console.error("⛔ Interceptor caught error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.code === "ECONNABORTED" || error.message.includes("Network Error")) {
      return Promise.reject(new Error(`Network Error: ${error.message}`));
    }

    const status = error.response?.status ?? "UNKNOWN_STATUS";
    const data = error.response?.data;
    let message = `HTTP ${status}`;


if (data && typeof data === "object") {
  if ("title" in data && typeof (data as any).title === "string") {
    message = (data as any).title;
  } else if ("message" in data && typeof (data as any).message === "string") {
    message = (data as any).message;
  } else {
    message = JSON.stringify(data);
  }
}

    return Promise.reject(new Error(message));
  }
);
const requests = {
  get: <T>(url: string) => axios.get<T>(url).then(responseBody),
  post: <T>(url: string, body: object) => axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: object) => axios.put<T>(url, body).then(responseBody),
  del: <T>(url: string) => axios.post<T>(url).then(responseBody),
};

const Services = {
  getAll: (params?: URLSearchParams) =>
    axios.get<ServiceData[]>("services/getAll", { params }).then(responseBody),
  getById: (id: string) => requests.get<ServiceData>(`services/${id}`),
};

const Nationality = {
  getAll: () => requests.get<NationalityData[]>("nationality"),
  getById: (id: string) => requests.get<NationalityData>(`nationality/${id}`),
};

const Payment = {
  initiate: (data: FormData) => requests.post("payment/initiate-payment", data),
  callback: (data: FormData) => requests.post("payment/payment-callback", data),
  getById: (id: string) => requests.get(`payment/${id}`),
  processGooglePayPayment: (paymentData: any) =>
    requests.post(`payment/google-pay`, paymentData),
};

const Bookings = {

  
uploadImage: (id: string, formData: FormData) =>
  axios.post<string>(`booking/${id}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 10000, // 10 seconds


  }).then(responseBody),
setPaymentTypeOfBooking: (id: string, type: paymentType) =>
  requests.put<string>(`booking/${id}/setPaymentType`, { type }),
 create: (booking: BookingSchema|DocumentBookingSchema|ResortsSchema) =>
    requests.post<BookingData>("booking", booking),
   getById: (id: string) => requests.get<BookingDetailsData>(`booking/${id}`),
   getBookingByCustomerId: (id: string) =>
    requests.get<BookingData[]>(`booking/Get-Booking-By-Customer-Id/${id}`),
  getBookingByEmail: (email: string) =>
    requests.get<BookingData[]>(
      `booking/Get-Booking-By-Email?email=${encodeURIComponent(email)}`
    ),
  getAvailableSlots: (date: string) =>
    requests.get<string[]>(`booking/available-slots/${date}`),
};

const Account = {
  current: () => requests.get<User>("account"),
  getUsersIdAndName: (params: URLSearchParams) =>
    axios
      .get<UserIdAndName[]
      >("account/getUsersIdAndName", { params })
      .then(responseBody),
  login: (user: LoginSchema) => requests.post<User>("account/login", user),
  checkUserExistsByEmail: (email: string) =>
    requests.get<boolean>(
      `account/check-user-exists?email=${encodeURIComponent(email)}`
    ),
  register: (user: RegisterSchema) =>
    requests.post<User>("account/register", user),
  registerWithEmail: (user: RegisterSchemaForEmail) =>
    requests.post<User>("account/register-with-otp", user),
  //admindelete: (id: string) => requests.del(`account/${id}`),
  delete: () => requests.del("account/delete"),
  update: (id: string, userDto: RegisterForUpdateSchema) =>
    requests.put<string>(`account/${id}`, userDto),
  getById: (id: string) =>
    requests.get<UserIdAndName>(`account/GetUserById/${id}`),
};

const agent = {
  Nationality,
  Services,
  Bookings,
  Payment,
  Account,

};

export default agent;