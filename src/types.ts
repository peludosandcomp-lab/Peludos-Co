export type ProductCategory = 
  | "smart-tech" 
  | "health" 
  | "nutrition" 
  | "hygiene" 
  | "wellbeing" 
  | "toys" 
  | "perfumes" 
  | "glasses" 
  | "cosmetics" 
  | "clothing" 
  | "jewelry" 
  | "bags" 
  | "watches";

export type ProductAvailability = "available" | "sold_out" | "coming_soon";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  image: string;
  details: string[];
  history: string;
  sizes?: string[];
  selectedSize?: string;
  isAvailable?: boolean;
  availability?: ProductAvailability;
}

export interface OrderCustomerDetails {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod?: "square_card" | "whatsapp";
  paymentToken?: string;
  paymentStatus?: "authorized" | "completed" | "pending";
  cardBrand?: string;
  cardLast4?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "concierge";
  text: string;
  timestamp: string;
}

export interface Appointment {
  id: string;
  boutique: string;
  service: string;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  status: "scheduled" | "cancelled";
}

export interface GiftingPreferences {
  category: string;
  recipient: string;
  occasion: string;
  budget: string;
}
