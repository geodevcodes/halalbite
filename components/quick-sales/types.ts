export type CategoryType = 
  | "All"
  | "Breakfast"
  | "Soups"
  | "Pasta"
  | "Main Course"
  | "Burgers"
  | "Drinks"
  | "BBQ";

export interface MenuItem {
  id: string;
  name: string;
  category: Exclude<CategoryType, "All">;
  price: number;
  image?: string;
  hasPhoto?: boolean;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}
