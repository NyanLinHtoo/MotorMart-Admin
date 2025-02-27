import { CarBrand } from "./carbrands";

export interface CarModelList {
  models: Model[];
}

export interface CarModel {
  id: number;
  title: string;
  carbrand_id: number;
  is_historic: boolean;
  carbrand: CarBrand;
}
