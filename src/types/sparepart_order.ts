export interface OrderSparepart {
  id: number;
  user: {
    username: string;
  };
  spare_part: {
    name: string;
  };
  price_per_unit: number;
  created_at: string;
  status: string;
} 