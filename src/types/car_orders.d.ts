export interface CarOrderList {
  orders: OrderCar [];
  total: number;
}

export interface OrderCar {
  id: number;
  email: string;
  username: string;
  phone_number: string;
  plate_no: string | number | null;
  total_seats: number | null;
  price: number;
  carmodel_title: string;
  carbrand_name: string;
  carbrand_country_code: string;
  carbrand_logo: string;
  cargallery_image_path: string;
  status:string;
  created_at: string;
}
