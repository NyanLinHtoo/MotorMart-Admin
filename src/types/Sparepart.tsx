export interface SparepartList {
    orders: Sparepart[];
    total: number;
  }
  
  export interface Sparepart {
    id: number;
    name: string;
    description: string;
    price: number;
    category: {
      id: number;
      name: string;
    };
  }

  export interface CreateSparepartPayload {
    name: string;
    description: string;
    price: number;
    spare_part_category_id: number;
  }
  