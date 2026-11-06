export const categories = [
  { id: "coffee", name: "Coffee Based", description: "Pilihan kopi dari menu kami." },
  { id: "milk", name: "Milk Based", description: "Tersedia dalam pilihan Hot atau Ice." },
  { id: "main", name: "Main Course", description: "Pilihan hidangan utama." },
  { id: "snack", name: "Snack", description: "Teman untuk waktu santai." },
  { id: "dessert", name: "Desserts", description: "Penutup untuk pesananmu." },
  { id: "squash", name: "Squash", description: "Pilihan buah dan soda." },
  { id: "appetizer", name: "Appetizer", description: "Pembuka sebelum hidangan utama." },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type Variant = { id: string; name: string; price: number };
export type MenuItem = {
  id: string;
  name: string;
  category: CategoryId;
  description?: string;
  variants: Variant[];
};

const regular = (price: number): Variant[] => [{ id: "regular", name: "Reguler", price }];
const temperatures = (hot: number, ice: number): Variant[] => [
  { id: "hot", name: "Hot", price: hot },
  { id: "ice", name: "Ice", price: ice },
];

// Transcribed from the supplied PDF, page 1; original names and prices retained.
export const menu: MenuItem[] = [
  { id: "matcha-latte", name: "Matcha Latte", category: "milk", variants: temperatures(23000, 25000) },
  { id: "redvelvet", name: "Redvelvet", category: "milk", variants: temperatures(23000, 25000) },
  { id: "chocolatte", name: "Chocolatte", category: "milk", variants: temperatures(23000, 25000) },
  { id: "choco-oreo", name: "Choco Oreo", category: "milk", variants: temperatures(23000, 25000) },
  { id: "cookies-n-cream", name: "Cookies N Cream", category: "milk", variants: temperatures(23000, 25000) },
  { id: "chocolate-cake", name: "Chocolate Cake", category: "dessert", description: "Chocolate cake with ice cream and strawberry", variants: regular(25000) },
  { id: "strawberry-cheesecake", name: "Strawberry Cheesecake", category: "dessert", description: "Strawberry cheesecake and vanilla ice cream", variants: regular(25000) },
  { id: "ice-cream", name: "Ice Cream", category: "dessert", description: "Chocolate, Strawberry, and Vanilla", variants: regular(15000) },
  { id: "french-fries", name: "French Fries", category: "snack", variants: regular(18000) },
  { id: "mix-platter", name: "Mix Platter", category: "snack", variants: regular(25000) },
  { id: "corn-ribs", name: "Corn Ribs", category: "snack", variants: regular(25000) },
  { id: "nasi-goreng-ayam", name: "Nasi Goreng Ayam", category: "main", variants: regular(30000) },
  { id: "magelangan-ayam", name: "Magelangan Ayam", category: "main", variants: regular(30000) },
  { id: "chicken-katsu", name: "Chicken Katsu", category: "main", description: "Ayam fillet goreng tepung", variants: regular(35000) },
  { id: "chicken-steak", name: "Chicken Steak with Mushroom Sauce", category: "main", variants: regular(47000) },
  { id: "aglio-olio", name: "Aglio Olio", category: "main", description: "Pasta spaghetti bumbu klasik zaitun keju bawang putih", variants: regular(35000) },
  { id: "dory-sambal-matah", name: "Dory Sambal Matah", category: "main", description: "Fillet patin goreng tepung", variants: regular(35000) },
  { id: "salad-sayur", name: "Salad Sayur", category: "appetizer", variants: regular(25000) },
  { id: "lychee-squash", name: "Lychee Squash", category: "squash", description: "Lychee, Soda, Lychee fruit", variants: regular(25000) },
  { id: "lemon-squash", name: "Lemon Squash", category: "squash", description: "Lemon, Soda, Slice Lemon", variants: regular(25000) },
  { id: "peach-squash", name: "Peach Squash", category: "squash", description: "Peach, Soda", variants: regular(25000) },
  { id: "berry-bounty", name: "Berry Bounty", category: "squash", description: "Mix berry, Soda", variants: regular(25000) },
  { id: "espresso", name: "Espresso", category: "coffee", variants: temperatures(23000, 25000) },
  { id: "americano", name: "Americano", category: "coffee", variants: temperatures(25000, 27000) },
  { id: "cappuccino", name: "Cappuccino", category: "coffee", variants: temperatures(23000, 25000) },
  { id: "latte", name: "Latte", category: "coffee", variants: temperatures(25000, 28000) },
  { id: "mochaccino", name: "Mochaccino", category: "coffee", variants: regular(28000) },
  { id: "affogato", name: "Affogato", category: "coffee", variants: regular(28000) },
  { id: "butterschotch", name: "Butterschotch", category: "coffee", variants: regular(27000) },
  { id: "caramel-latte", name: "Caramel Latte", category: "coffee", variants: regular(27000) },
  { id: "vanilla-latte", name: "Vanilla Latte", category: "coffee", variants: regular(27000) },
  { id: "aren-latte", name: "Aren Latte", category: "coffee", variants: regular(27000) },
];
