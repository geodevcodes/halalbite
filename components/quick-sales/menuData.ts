import { MenuItem } from "./types";

export const initialMenuItems: MenuItem[] = [
  // Breakfast
  {
    id: "bf-1",
    name: "Jollof Rice and Chicken",
    category: "Breakfast",
    price: 3500.0,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80",
    hasPhoto: true,
  },
  {
    id: "bf-2",
    name: "Fried rice",
    category: "Breakfast",
    price: 4000.0,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80",
    hasPhoto: true,
  },
  {
    id: "bf-3",
    name: "Meat rice with side Salad",
    category: "Breakfast",
    price: 5200.0,
    hasPhoto: false,
  },
  {
    id: "bf-4",
    name: "Roasted meat with grilled potatoes",
    category: "Breakfast",
    price: 12500.0,
    hasPhoto: false,
  },
  {
    id: "bf-5",
    name: "Herb Roasted Chicken",
    category: "Breakfast",
    price: 4300.0,
    hasPhoto: false,
  },

  // Burgers
  {
    id: "bg-1",
    name: "Burger with Chicken Chips",
    category: "Burgers",
    price: 4500.0,
    hasPhoto: false,
  },
  {
    id: "bg-2",
    name: "Classic Halal Beef Burger",
    category: "Burgers",
    price: 4200.0,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    hasPhoto: true,
  },

  // Drinks
  {
    id: "dr-1",
    name: "Orange with Mango mix Juice",
    category: "Drinks",
    price: 3200.0,
    hasPhoto: false,
  },
  {
    id: "dr-2",
    name: "Ice cream tamu",
    category: "Drinks",
    price: 4000.0,
    hasPhoto: false,
  },
  {
    id: "dr-3",
    name: "Strawberry Juice",
    category: "Drinks",
    price: 9800.0,
    hasPhoto: false,
  },
  {
    id: "dr-4",
    name: "Pineapple Juice",
    category: "Drinks",
    price: 3200.0,
    hasPhoto: false,
  },
  {
    id: "dr-5",
    name: "Mango with Ginger Juice",
    category: "Drinks",
    price: 6100.0,
    hasPhoto: false,
  },
  {
    id: "dr-6",
    name: "Masala chai Tea",
    category: "Drinks",
    price: 1500.0,
    hasPhoto: false,
  },

  // Soups
  {
    id: "sp-1",
    name: "Egusi Soup with Goat Meat",
    category: "Soups",
    price: 4800.0,
    hasPhoto: false,
  },
  {
    id: "sp-2",
    name: "Spicy Pepper Soup",
    category: "Soups",
    price: 3800.0,
    hasPhoto: false,
  },

  // Pasta
  {
    id: "ps-1",
    name: "Spicy Chicken Penne Pasta",
    category: "Pasta",
    price: 4500.0,
    hasPhoto: false,
  },
  {
    id: "ps-2",
    name: "Creamy Garlic Fettuccine",
    category: "Pasta",
    price: 4000.0,
    hasPhoto: false,
  },

  // Main Course
  {
    id: "mc-1",
    name: "Special Lamb Biryani",
    category: "Main Course",
    price: 7500.0,
    hasPhoto: false,
  },
  {
    id: "mc-2",
    name: "Grilled Fish with Plantain",
    category: "Main Course",
    price: 6800.0,
    hasPhoto: false,
  },

  // BBQ
  {
    id: "bbq-1",
    name: "Halal Beef Suya Skewers",
    category: "BBQ",
    price: 3000.0,
    hasPhoto: false,
  },
  {
    id: "bbq-2",
    name: "Smoked BBQ Chicken Wings",
    category: "BBQ",
    price: 4500.0,
    hasPhoto: false,
  },
];
