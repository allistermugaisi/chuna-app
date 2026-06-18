// ─── Brand colours (match home screen) ────────────────────────────────────────
export const GREEN = "#4CAF20";
export const GREEN_DARK = "#388E3C";
export const GREEN_LIGHT = "#E8F5E9";
export const BG = "#F4F6F8";
export const WHITE = "#FFFFFF";
export const BORDER = "#EEEEEE";
export const TEXT_DARK = "#1A1A1A";
export const TEXT_MID = "#555555";
export const TEXT_FAINT = "#999999";
export const BLUE_ACCENT = "#2196F3";
export const GOLD = "#F59E0B";
export const RED = "#E53935";

// ─── Bid status helpers ────────────────────────────────────────────────────────
export const STATUS = {
  OPEN: { label: "Open", color: GREEN, bg: GREEN_LIGHT },
  PENDING: { label: "Pending", color: GOLD, bg: "#FEF3C7" },
  ACCEPTED: { label: "Accepted", color: BLUE_ACCENT, bg: "#EFF6FF" },
  CLOSED: { label: "Closed", color: "#999", bg: "#F3F4F6" },
  CANCELLED: { label: "Cancelled", color: RED, bg: "#FEE2E2" },
};

// ─── Product categories ────────────────────────────────────────────────────────
export const CATEGORIES = [
  { key: "all", label: "All", emoji: "🛒" },
  { key: "electronics", label: "Electronics", emoji: "📱" },
  { key: "furniture", label: "Furniture", emoji: "🪑" },
  { key: "vehicles", label: "Vehicles", emoji: "🚗" },
  { key: "land", label: "Land", emoji: "🏡" },
  { key: "services", label: "Services", emoji: "🛠️" },
  { key: "agri", label: "Agriculture", emoji: "🌾" },
  { key: "other", label: "Other", emoji: "📦" },
];

// ─── Mock listings ─────────────────────────────────────────────────────────────
export const MOCK_BIDS = [
  {
    id: "B001",
    title: "Samsung 65-inch 4K Smart TV",
    category: "electronics",
    description:
      'Brand new Samsung QLED 65" 4K Smart TV with remote. Still in box, bought recently but upgrading to larger size. Comes with 1-year Samsung warranty.',
    askingPrice: 120000,
    currentBid: 98000,
    bidCount: 7,
    minBidIncrement: 2000,
    condition: "New",
    location: "Nairobi, Westlands",
    seller: {
      name: "James Mwangi",
      memberNo: "CS-10234",
      avatar: "JM",
      rating: 4.8,
      totalSales: 12,
    },
    images: [
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80",
    ],
    postedAt: "2026-05-26T08:00:00Z",
    endsAt: "2026-06-05T18:00:00Z",
    status: "OPEN",
    shares: 150,
    tags: ["Samsung", "Smart TV", "4K", "QLED"],
  },
  {
    id: "B002",
    title: "Honda CB500F Motorcycle 2022",
    category: "vehicles",
    description:
      "Well-maintained Honda CB500F, 2022 model. 18,000 km on odometer. Recently serviced. Full logbook available. Reason for selling: relocating abroad.",
    askingPrice: 580000,
    currentBid: 540000,
    bidCount: 3,
    minBidIncrement: 5000,
    condition: "Used – Good",
    location: "Mombasa, Nyali",
    seller: {
      name: "Aisha Oduya",
      memberNo: "CS-00891",
      avatar: "AO",
      rating: 5.0,
      totalSales: 4,
    },
    images: [
      "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=600&q=80",
    ],
    postedAt: "2026-05-24T10:30:00Z",
    endsAt: "2026-06-08T18:00:00Z",
    status: "OPEN",
    shares: 220,
    tags: ["Honda", "Motorcycle", "2022"],
  },
  {
    id: "B003",
    title: "Office Desk & Chair Set",
    category: "furniture",
    description:
      "L-shaped executive office desk with ergonomic mesh chair. 2 years old. Minor scuffs on desk edge. Dimensions: 160×120 cm. Must collect.",
    askingPrice: 45000,
    currentBid: 28000,
    bidCount: 11,
    minBidIncrement: 500,
    condition: "Used – Fair",
    location: "Nairobi, Karen",
    seller: {
      name: "Patrick Oloo",
      memberNo: "CS-03312",
      avatar: "PO",
      rating: 4.5,
      totalSales: 8,
    },
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
    ],
    postedAt: "2026-05-25T14:00:00Z",
    endsAt: "2026-06-03T18:00:00Z",
    status: "OPEN",
    shares: 80,
    tags: ["Office", "Desk", "Chair", "Furniture"],
  },
  {
    id: "B004",
    title: "50×100 Plot – Ruiru Bypass",
    category: "land",
    description:
      "Ready title deed. 50×100 ft plot along Ruiru Bypass, near Eastern bypass interchange. Water and electricity available. Ideal for residential or commercial use.",
    askingPrice: 3200000,
    currentBid: 3050000,
    bidCount: 2,
    minBidIncrement: 50000,
    condition: "N/A",
    location: "Ruiru, Kiambu County",
    seller: {
      name: "Grace Wanjiku",
      memberNo: "CS-00567",
      avatar: "GW",
      rating: 4.9,
      totalSales: 6,
    },
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
    ],
    postedAt: "2026-05-20T09:00:00Z",
    endsAt: "2026-06-20T18:00:00Z",
    status: "OPEN",
    shares: 500,
    tags: ["Land", "Plot", "Title Deed", "Ruiru"],
  },
  {
    id: "B005",
    title: "Plumbing & Electrical Services",
    category: "services",
    description:
      "Professional plumbing and electrical installations for residential and commercial buildings. 10+ years experience. Nairobi and surroundings. Free site assessment.",
    askingPrice: 15000,
    currentBid: 12000,
    bidCount: 5,
    minBidIncrement: 500,
    condition: "Service",
    location: "Nairobi CBD",
    seller: {
      name: "Samuel Kariuki",
      memberNo: "CS-07823",
      avatar: "SK",
      rating: 4.7,
      totalSales: 20,
    },
    images: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&q=80",
    ],
    postedAt: "2026-05-28T07:00:00Z",
    endsAt: "2026-06-10T18:00:00Z",
    status: "OPEN",
    shares: 60,
    tags: ["Plumbing", "Electrical", "Services"],
  },
  {
    id: "B006",
    title: "MacBook Pro M3 14-inch",
    category: "electronics",
    description:
      'Apple MacBook Pro 14" M3 chip, 16 GB RAM, 512 GB SSD. Space Grey. 8 months old, still under Apple Care+. Comes with original box and charger.',
    askingPrice: 210000,
    currentBid: 190000,
    bidCount: 14,
    minBidIncrement: 2000,
    condition: "Used – Excellent",
    location: "Nairobi, Kilimani",
    seller: {
      name: "Diana Njeri",
      memberNo: "CS-11204",
      avatar: "DN",
      rating: 4.6,
      totalSales: 9,
    },
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
    ],
    postedAt: "2026-05-27T16:00:00Z",
    endsAt: "2026-06-04T18:00:00Z",
    status: "OPEN",
    shares: 200,
    tags: ["Apple", "MacBook", "Laptop", "M3"],
  },
];

// ─── My bids (logged-in member's listings) ─────────────────────────────────────
export const MY_BIDS = [
  {
    id: "MB001",
    title: "Nikon D7500 Camera + Lenses",
    category: "electronics",
    askingPrice: 95000,
    currentBid: 78000,
    bidCount: 9,
    endsAt: "2026-06-07T18:00:00Z",
    status: "OPEN",
    images: [
      "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=600&q=80",
    ],
  },
  {
    id: "MB002",
    title: "Toyota Fielder 2018 – White",
    category: "vehicles",
    askingPrice: 1450000,
    currentBid: 1380000,
    bidCount: 4,
    endsAt: "2026-06-15T18:00:00Z",
    status: "PENDING",
    images: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80",
    ],
  },
  {
    id: "MB003",
    title: "3-bedroom House – Juja",
    category: "land",
    askingPrice: 6500000,
    currentBid: 0,
    bidCount: 0,
    endsAt: "2026-07-01T18:00:00Z",
    status: "OPEN",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
    ],
  },
];

// ─── My shares ─────────────────────────────────────────────────────────────────
export const MY_SHARES = {
  totalShares: 1240,
  shareValue: 100, // KES per share
  totalValue: 124000,
  availableShares: 1240,
  pendingDividend: 4800,
  lastDividend: { amount: 12400, date: "Dec 2025" },
  history: [
    { month: "Jan 2026", dividend: 1240, shares: 1200 },
    { month: "Feb 2026", dividend: 1260, shares: 1210 },
    { month: "Mar 2026", dividend: 1200, shares: 1220 },
    { month: "Apr 2026", dividend: 1350, shares: 1230 },
    { month: "May 2026", dividend: 1400, shares: 1240 },
  ],
};
