export interface CarPagination {
  total: number;
  cars: CarType[] | [];
}

export interface CarType {
  id: number;
  plate_no: string;
  total_seats: number;
  price: number;
  carmodel_title: string;
  carbrand_name: string;
  cargallery_image_path: string;
  created_at?: string;
  carbrand_country_code?: string;
  carbrand_logo?: string;
  // carmodel_id: number;
}

export interface CreateCarPayload {
  carmodel_id: number;
  image_path: string;
  plate_no: number;
  price: number;
  total_seats: number;
}
