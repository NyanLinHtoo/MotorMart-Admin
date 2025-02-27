export interface CarBrandList {
  total: number;
  carbrands: CarBrand[];
}
export interface CarBrand {
  id: number;
  name: string;
  brand_logo: string;
  country_code: string;
}
