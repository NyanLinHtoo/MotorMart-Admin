export interface BookingTypeList {
  total: number;
  bookings: BookingType[];
}

export interface BookingType {
  id: number;
  additional_note: string;
  carbrand_country_code: string;
  carbrand_logo: string;
  carbrand_name: string;
  cargallery_image_path: string;
  carmodel_title: string;
  created_at: string;
  email: string;
  phone_number: string;
  preferred_date: string;
  preferred_time: string;
  plate_no: string | number | null;
  total_seats: number | null;
  price: number;
  username: string;
  car_id: number;
  user_id: number;
}

