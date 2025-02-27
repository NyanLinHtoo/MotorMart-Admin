import axios from "axios";
import { API_URL } from "../util/constant";
import { BookingType } from "../types/booking";
import {
  AddAdminUserPayload,
  LoginPayload,
  RegisterPayload,
  UpdateAdminUserPayload,
  UpdateAdminPayload,
} from "../types/login";
import { CreateSparepartPayload } from "../types/Sparepart";
import { CreateCarPayload } from "../types/cartype";
import { OrderSparepart } from "../types/sparepart_order";

import apiClient from "./apiClient";

// Add this interface for the spare part creation payload

const ApiService = {
  getCarListing: async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      brand_id?: number;
      model_id?: number;
      keyword?: string;
    }
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.brand_id) {
      params.append("brand_id", filters.brand_id.toString());
    }
    if (filters?.model_id) {
      params.append("model_id", filters.model_id.toString());
    }
    if (filters?.keyword) {
      params.append("keyword", filters.keyword);
    }

    return axios.get(`${API_URL}/cars?${params.toString()}`);
  },

  createNewCar: async (car: CreateCarPayload) => {
    return apiClient.post(`${API_URL}/cars`, car);
  },

  updateCar: async (carId: number, car: CreateCarPayload) => {
    return apiClient.put(`${API_URL}/cars/${carId}`, {
      carmodel_id: car.carmodel_id,
      image_path: car.image_path,
      plate_no: car.plate_no,
      price: car.price,
      total_seats: car.total_seats,
    });
  },

  deleteCar: async (carId: number) => {
    return apiClient.delete(`${API_URL}/cars/${carId}`);
  },

  getCarWithPagin: async (
    page: number = 1,
    limit: number = 10,
    filters?: { brand_id?: number; model_id?: number; keyword?: string }
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.brand_id) {
      params.append("brand_id", filters.brand_id.toString());
    }

    if (filters?.model_id) {
      params.append("model_id", filters.model_id.toString());
    }

    if (filters?.keyword) {
      params.append("keyword", filters.keyword);
    }

    const response = await axios.get(`${API_URL}/cars?${params.toString()}`);
    return response;
  },

  getCarModel: async (brand_id: number) => {
    const response = await axios.get(API_URL + "/carmodels/" + brand_id);
    return response;
  },

  getCarDetail: async (id: number) => {
    const response = await axios.get(API_URL + "/cars/" + id);
    return response;
  },

  getCarBrandsWithPagin: async (page: number = 1, limit: number = 25) => {
    const response = await axios.get(
      API_URL + "/carbrands?page=" + page + "&limit=" + limit
    );
    return response;
  },

  getCarBrandsWithName: async (name: string) => {
    const response = await axios.get(API_URL + "/carbrands?keyword=" + name);
    return response;
  },

  getAllCarBrands: async (page: number = 1, limit: number = 50000) => {
    const response = await axios.get(
      API_URL + "/carbrands?page=" + page + "&limit=" + limit
    );
    return response;
  },

  loginUser: async (payload: LoginPayload) => {
    const response = await axios.post(API_URL + "/auth/login", payload);
    return response;
  },

  getUserList: async (page: number = 1, pageSize: number = 25) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      status: "ACTIVE",
      deleted: "false",
    });
    const response = await apiClient.get(
      `${API_URL}/admin/users?${params.toString()}`
    );
    return response;
  },

  registerUser: async (payload: RegisterPayload) => {
    const response = await axios.post(API_URL + "/auth/signup", payload);
    return response;
  },

  createAdminUser: async (payload: AddAdminUserPayload) => {
    const response = await apiClient.post(API_URL + "/admin/users", payload);
    return response;
  },

  updateUser: async (userId: number, payload: UpdateAdminUserPayload) => {
    try {
      const response = await apiClient.put(
        API_URL + "/admin/users/" + userId,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  updateAdmin: async (userId: number, payload: UpdateAdminPayload) => {
    try {
      const response = await apiClient.put(
        API_URL + "/admin/users/" + userId,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating admin:", error);
      throw error;
    }
  },

  deleteUser: async (userId: number) => {
    try {
      const response = await apiClient.delete(
        API_URL + "/admin/users/" + userId
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  },

  postCarOrder: async (payload: any) => {
    const response = await apiClient.post(API_URL + "/order", payload);
    return response;
  },

  getCarOrderList: async (
    page: number = 1,
    limit: number = 10
    // search?: string
  ) => {
    const params: any = {
      page: page.toString(),
      limit: limit.toString(),
    };

    const response = await apiClient.get(`${API_URL}/order/all`, { params });
    return response;
  },

  changeCarOrderStatus: async (order_id: number, newStatus: string) => {
    try {
      const response = await apiClient.put(
        `${API_URL}/order/admin/${order_id}/status/`,
        { status: newStatus }
      );
      return response;
    } catch (error: any) {
      console.error(
        "Failed to update order status:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  getCarOrderListByCurrentUser: async () => {
    const response = await apiClient.get(API_URL + "/order");
    return response;
  },

  postCarBooking: async (payload: BookingType) => {
    const response = await apiClient.post(API_URL + "/booking", payload);
    return response;
  },

  getBookingList: async () => {
    const response = await apiClient.get(API_URL + "/booking/user/");
    return response;
  },

  getSparepartList: async (
    page: number = 1,
    limit: number = 10,
    filters?: { category_id?: number; car_model_id?: number; keword?: string }
  ) => {
    const params: any = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (filters?.category_id) {
      params.append("category_id", filters.category_id.toString());
    }

    if (filters?.car_model_id) {
      params.append("car_model_id", filters.car_model_id.toString());
    }
    if (filters?.keword) {
      params.append("keyword", filters.keword.toString());
    }

    const response = await apiClient.get(`${API_URL}/spare-parts`, { params });
    return response;
  },

  createSparepart: (data: CreateSparepartPayload) => {
    return apiClient.post(`${API_URL}/spare-parts`, data);
  },

  updateSparepart: (sparepartId: number, data: CreateSparepartPayload) => {
    return apiClient.put(`${API_URL}/spare-parts/${sparepartId}`, data);
  },

  deleteSparepart: (sparepartId: number) => {
    return apiClient.delete(`${API_URL}/spare-parts/${sparepartId}`);
  },

  getSparepartCategory: async () => {
    const response = await apiClient.get(`${API_URL}/spare-parts/categories`);
    return response;
  },

  getSparepartOrderList: async (
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      status?: string;
      spare_part_id?: number;
      start_date?: string;
      end_date?: string;
    }
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.spare_part_id) {
      params.append("spare_part_id", filters.spare_part_id.toString());
    }
    if (filters?.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters?.end_date) {
      params.append("end_date", filters.end_date);
    }

    const response = await apiClient.get(
      `${API_URL}/spare-part-orders/admin?${params.toString()}`
    );
    return response;
  },

  createSparepartOrder: async (payload: OrderSparepart) => {
    const response = await apiClient.post(
      `${API_URL}/spare-parts/orders`,
      payload
    );
    return response;
  },

  changeSparePartOrderStatus: async (orderId: number, newStatus: string) => {
    try {
      const response = await apiClient.put(
        `${API_URL}/spare-part-orders/admin/${orderId}/status`,
        {
          status: newStatus,
        }
      );
      return response;
    } catch (error: any) {
      console.error(
        "Failed to update order status:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  deleteSparepartOrder: async (orderId: number) => {
    const response = await apiClient.delete(
      `${API_URL}/spare-part-orders/admin/${orderId}`
    );
    return response;
  },

  getCarModelByTitle: async (brandId: number) => {
    return axios.get(`${API_URL}/carmodels/${brandId}`);
  },
};

export default ApiService;
