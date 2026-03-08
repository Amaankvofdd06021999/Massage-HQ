import type {
  StaffMember, ServiceOption, Booking, Promotion,
  Customer, TrialRotation, DashboardStats, TimeSlot, StaffBlockedDate,
  CancellationPolicy, CancellationRecord, ClientNote, GiftCard,
  LoyaltyConfig, LoyaltyStamp, LoyaltyRedemption, LoyaltyPointRedemption,
  StaffMessage, PromoSessionUsage, BookingReminder, LateArrivalClaim,
  MassageType, PurchasedPromotion, TipClaim,
} from "@/lib/types"

// ─── Staff ────────────────────────────────────────
export const staffMembers: StaffMember[] = [
  {
    id: "s1", name: "Somchai Patel", nickname: "Joy",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    bio: "With over 12 years of experience in traditional Thai massage, Joy combines ancient techniques with modern therapeutic approaches for deep relaxation.",
    specialties: ["thai", "deep-tissue", "sports", "foot"],
    languages: ["thai", "english"],
    yearsExperience: 12, rating: 4.9, totalReviews: 342, pricePerHour: 1200,
    availability: {
      mon: { start: "10:00", end: "20:00" }, tue: { start: "10:00", end: "20:00" },
      wed: null, thu: { start: "10:00", end: "20:00" }, fri: { start: "10:00", end: "22:00" },
      sat: { start: "10:00", end: "22:00" }, sun: { start: "12:00", end: "18:00" },
    },
    isAvailableToday: true, isFeatured: true,
    certifications: ["Thai Healing Alliance", "Sports Massage Diploma"],
    gallery: [],
  },
  {
    id: "s2", name: "Natthaya Srikam", nickname: "Mint",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    bio: "Mint specialises in aromatherapy and Swedish massage, creating deeply calming sessions using premium essential oil blends.",
    specialties: ["swedish", "aromatherapy", "hot-stone"],
    languages: ["thai", "english", "mandarin"],
    yearsExperience: 8, rating: 4.8, totalReviews: 256, pricePerHour: 1100,
    availability: {
      mon: { start: "10:00", end: "20:00" }, tue: { start: "10:00", end: "20:00" },
      wed: { start: "10:00", end: "20:00" }, thu: null, fri: { start: "10:00", end: "22:00" },
      sat: { start: "10:00", end: "22:00" }, sun: { start: "12:00", end: "18:00" },
    },
    isAvailableToday: true, isFeatured: true,
    certifications: ["CIDESCO Diploma", "Aromatherapy Association"],
    gallery: [],
  },
  {
    id: "s3", name: "Kenta Yamamoto", nickname: "Ken",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    bio: "Ken brings the art of Japanese Shiatsu to every session. His precise pressure point work relieves chronic pain and restores energy flow.",
    specialties: ["shiatsu", "deep-tissue", "reflexology"],
    languages: ["japanese", "english"],
    yearsExperience: 15, rating: 4.95, totalReviews: 189, pricePerHour: 1400,
    availability: {
      mon: { start: "12:00", end: "20:00" }, tue: null, wed: { start: "12:00", end: "20:00" },
      thu: { start: "12:00", end: "20:00" }, fri: { start: "12:00", end: "22:00" },
      sat: { start: "10:00", end: "22:00" }, sun: null,
    },
    isAvailableToday: false, isFeatured: true,
    certifications: ["Japan Shiatsu Association", "ITEC Level 4"],
    gallery: [],
  },
  {
    id: "s4", name: "Priya Charoenpong", nickname: "Ploy",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    bio: "Ploy is known for her gentle yet effective hot stone therapy. Her calming presence makes every session a rejuvenating escape.",
    specialties: ["hot-stone", "aromatherapy", "swedish"],
    languages: ["thai", "english", "korean"],
    yearsExperience: 6, rating: 4.7, totalReviews: 178, pricePerHour: 1000,
    availability: {
      mon: { start: "10:00", end: "18:00" }, tue: { start: "10:00", end: "18:00" },
      wed: { start: "10:00", end: "18:00" }, thu: { start: "10:00", end: "18:00" },
      fri: null, sat: { start: "10:00", end: "22:00" }, sun: { start: "10:00", end: "18:00" },
    },
    isAvailableToday: true, isFeatured: false,
    certifications: ["Hot Stone Therapy Certificate"],
    gallery: [],
  },
  {
    id: "s5", name: "Channarong Lim", nickname: "Tong",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    bio: "Tong specialises in sports massage and rehabilitation. A former athlete, he understands the demands placed on active bodies.",
    specialties: ["sports", "deep-tissue", "thai"],
    languages: ["thai", "english"],
    yearsExperience: 10, rating: 4.85, totalReviews: 224, pricePerHour: 1300,
    availability: {
      mon: { start: "10:00", end: "20:00" }, tue: { start: "10:00", end: "20:00" },
      wed: { start: "10:00", end: "20:00" }, thu: { start: "10:00", end: "20:00" },
      fri: { start: "10:00", end: "22:00" }, sat: null, sun: null,
    },
    isAvailableToday: true, isFeatured: false,
    certifications: ["Sports Massage Level 5", "Rehabilitation Therapy"],
    gallery: [],
  },
  {
    id: "s6", name: "Mei-Lin Chen", nickname: "Mei",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    bio: "Mei combines traditional Chinese reflexology with modern wellness techniques. Her foot treatments are legendary among regulars.",
    specialties: ["reflexology", "shiatsu", "aromatherapy", "foot"],
    languages: ["mandarin", "english", "thai"],
    yearsExperience: 9, rating: 4.75, totalReviews: 198, pricePerHour: 1100,
    availability: {
      mon: null, tue: { start: "10:00", end: "20:00" }, wed: { start: "10:00", end: "20:00" },
      thu: { start: "10:00", end: "20:00" }, fri: { start: "10:00", end: "22:00" },
      sat: { start: "10:00", end: "22:00" }, sun: { start: "12:00", end: "18:00" },
    },
    isAvailableToday: true, isFeatured: false,
    certifications: ["Chinese Reflexology Association", "TCM Foundations"],
    gallery: [],
  },
]

// ─── Services ─────────────────────────────────────
export const services: ServiceOption[] = [
  {
    id: "srv1", name: "Traditional Thai Massage", type: "thai",
    description: "Ancient healing art combining acupressure, stretching, and energy work along the body's sen lines.",
    durations: [{ minutes: 60, price: 800 }, { minutes: 90, price: 1100 }, { minutes: 120, price: 1400 }],
    isPopular: true, isActive: true,
  },
  {
    id: "srv2", name: "Swedish Relaxation", type: "swedish",
    description: "Classic long-stroke massage for full-body relaxation, improved circulation and stress relief.",
    durations: [{ minutes: 60, price: 900 }, { minutes: 90, price: 1200 }, { minutes: 120, price: 1500 }],
    isPopular: true, isActive: true,
  },
  {
    id: "srv3", name: "Deep Tissue Therapy", type: "deep-tissue",
    description: "Intense pressure targeting deep muscle layers to release chronic tension and knots.",
    durations: [{ minutes: 60, price: 1000 }, { minutes: 90, price: 1400 }, { minutes: 120, price: 1800 }],
    isPopular: true, isActive: true,
  },
  {
    id: "srv4", name: "Aromatherapy Bliss", type: "aromatherapy",
    description: "Therapeutic massage enhanced with premium essential oil blends for mind-body harmony.",
    durations: [{ minutes: 60, price: 1000 }, { minutes: 90, price: 1350 }, { minutes: 120, price: 1700 }],
    isPopular: false, isActive: true,
  },
  {
    id: "srv5", name: "Hot Stone Therapy", type: "hot-stone",
    description: "Heated basalt stones placed along energy centres while soothing strokes melt away tension.",
    durations: [{ minutes: 60, price: 1100 }, { minutes: 90, price: 1500 }, { minutes: 120, price: 1900 }],
    isPopular: false, isActive: true,
  },
  {
    id: "srv6", name: "Sports Recovery", type: "sports",
    description: "Athletic-focused treatment combining deep pressure, stretching, and targeted trigger point therapy.",
    durations: [{ minutes: 60, price: 1100 }, { minutes: 90, price: 1500 }],
    isPopular: false, isActive: true,
  },
  {
    id: "srv7", name: "Reflexology", type: "reflexology",
    description: "Pressure point therapy on feet and hands stimulating corresponding organs and systems.",
    durations: [{ minutes: 30, price: 500 }, { minutes: 60, price: 900 }],
    isPopular: false, isActive: true,
  },
  {
    id: "srv8", name: "Japanese Shiatsu", type: "shiatsu",
    description: "Rhythmic finger pressure along meridian lines to restore energy balance and relieve pain.",
    durations: [{ minutes: 60, price: 1200 }, { minutes: 90, price: 1600 }],
    isPopular: false, isActive: true,
  },
  {
    id: "srv9",
    name: "Foot Massage",
    type: "foot" as MassageType,
    description: "Targeted pressure-point therapy focusing on feet and lower legs. Relieves tension, improves circulation, and promotes overall relaxation through reflexology zones.",
    durations: [
      { minutes: 30, price: 400 },
      { minutes: 60, price: 700 },
      { minutes: 90, price: 950 },
    ],
    isPopular: true,
    isActive: true,
  },
]

// ─── Bookings ─────────────────────────────────────
export const bookings: Booking[] = [
  {
    id: "b1", customerId: "c1", customerName: "Alex Chen", staffId: "s1", staffName: "Joy",
    staffAvatar: staffMembers[0].avatar,
    serviceId: "srv1", serviceName: "Traditional Thai Massage", serviceType: "thai",
    date: "2026-02-23", startTime: "14:00", endTime: "15:30", duration: 90, price: 1100,
    status: "confirmed", createdAt: "2026-02-20T10:30:00Z",
  },
  {
    id: "b2", customerId: "c2", customerName: "Sarah Kim", staffId: "s2", staffName: "Mint",
    staffAvatar: staffMembers[1].avatar,
    serviceId: "srv2", serviceName: "Swedish Relaxation", serviceType: "swedish",
    date: "2026-02-23", startTime: "11:00", endTime: "12:00", duration: 60, price: 900,
    status: "confirmed", createdAt: "2026-02-19T15:00:00Z",
  },
  {
    id: "b3", customerId: "c3", customerName: "James Wong", staffId: "s3", staffName: "Ken",
    staffAvatar: staffMembers[2].avatar,
    serviceId: "srv8", serviceName: "Japanese Shiatsu", serviceType: "shiatsu",
    date: "2026-02-23", startTime: "16:00", endTime: "17:30", duration: 90, price: 1600,
    status: "confirmed", createdAt: "2026-02-21T09:00:00Z",
  },
  {
    id: "b4", customerId: "c1", customerName: "Alex Chen", staffId: "s4", staffName: "Ploy",
    staffAvatar: staffMembers[3].avatar,
    serviceId: "srv5", serviceName: "Hot Stone Therapy", serviceType: "hot-stone",
    date: "2026-02-23", startTime: "10:00", endTime: "11:30", duration: 90, price: 1500,
    status: "in-progress", createdAt: "2026-02-18T14:00:00Z",
  },
  {
    id: "b5", customerId: "c2", customerName: "Sarah Kim", staffId: "s5", staffName: "Tong",
    staffAvatar: staffMembers[4].avatar,
    serviceId: "srv6", serviceName: "Sports Recovery", serviceType: "sports",
    date: "2026-02-23", startTime: "15:00", endTime: "16:30", duration: 90, price: 1500,
    status: "confirmed", createdAt: "2026-02-22T08:00:00Z",
  },
  {
    id: "b6", customerId: "c3", customerName: "James Wong", staffId: "s1", staffName: "Joy",
    staffAvatar: staffMembers[0].avatar,
    serviceId: "srv3", serviceName: "Deep Tissue Therapy", serviceType: "deep-tissue",
    date: "2026-02-22", startTime: "14:00", endTime: "15:00", duration: 60, price: 1000,
    status: "completed", rating: 5, review: "Absolutely incredible session. Joy worked magic on my back tension.",
    tip: 200, createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "b7", customerId: "c1", customerName: "Alex Chen", staffId: "s2", staffName: "Mint",
    staffAvatar: staffMembers[1].avatar,
    serviceId: "srv4", serviceName: "Aromatherapy Bliss", serviceType: "aromatherapy",
    date: "2026-02-21", startTime: "16:00", endTime: "17:30", duration: 90, price: 1350,
    status: "completed", rating: 4, review: "Lovely session, very relaxing atmosphere.",
    tip: 100, createdAt: "2026-02-14T12:00:00Z",
  },
  {
    id: "b8", customerId: "c2", customerName: "Sarah Kim", staffId: "s6", staffName: "Mei",
    staffAvatar: staffMembers[5].avatar,
    serviceId: "srv7", serviceName: "Reflexology", serviceType: "reflexology",
    date: "2026-02-20", startTime: "11:00", endTime: "12:00", duration: 60, price: 900,
    status: "completed", rating: 5, review: "Mei's reflexology is the best in town.",
    tip: 200, createdAt: "2026-02-13T09:00:00Z",
  },
  {
    id: "b9", customerId: "c3", customerName: "James Wong", staffId: "s5", staffName: "Tong",
    staffAvatar: staffMembers[4].avatar,
    serviceId: "srv6", serviceName: "Sports Recovery", serviceType: "sports",
    date: "2026-02-19", startTime: "17:00", endTime: "18:30", duration: 90, price: 1500,
    status: "completed", rating: 5, createdAt: "2026-02-12T10:00:00Z",
  },
  {
    id: "b10", customerId: "c1", customerName: "Alex Chen", staffId: "s3", staffName: "Ken",
    staffAvatar: staffMembers[2].avatar,
    serviceId: "srv8", serviceName: "Japanese Shiatsu", serviceType: "shiatsu",
    date: "2026-02-18", startTime: "13:00", endTime: "14:30", duration: 90, price: 1600,
    status: "cancelled", notes: "Customer requested cancellation",
    createdAt: "2026-02-10T14:00:00Z",
  },
  {
    id: "b11", customerId: "c2", customerName: "Sarah Kim", staffId: "s1", staffName: "Joy",
    staffAvatar: staffMembers[0].avatar,
    serviceId: "srv1", serviceName: "Traditional Thai Massage", serviceType: "thai",
    date: "2026-02-17", startTime: "10:00", endTime: "12:00", duration: 120, price: 1400,
    status: "completed", rating: 5, review: "Two hours of pure bliss.",
    tip: 500, createdAt: "2026-02-10T08:00:00Z",
  },
  {
    id: "b12", customerId: "c3", customerName: "James Wong", staffId: "s4", staffName: "Ploy",
    staffAvatar: staffMembers[3].avatar,
    serviceId: "srv5", serviceName: "Hot Stone Therapy", serviceType: "hot-stone",
    date: "2026-02-16", startTime: "15:00", endTime: "16:30", duration: 90, price: 1500,
    status: "no-show", createdAt: "2026-02-09T11:00:00Z",
  },
  {
    id: "b13", customerId: "c1", customerName: "Alex Chen", staffId: "s6", staffName: "Mei",
    staffAvatar: staffMembers[5].avatar,
    serviceId: "srv7", serviceName: "Reflexology", serviceType: "reflexology",
    date: "2026-02-24", startTime: "14:00", endTime: "15:00", duration: 60, price: 900,
    status: "pending", createdAt: "2026-02-22T16:00:00Z",
  },
  {
    id: "b14", customerId: "c2", customerName: "Sarah Kim", staffId: "s3", staffName: "Ken",
    staffAvatar: staffMembers[2].avatar,
    serviceId: "srv3", serviceName: "Deep Tissue Therapy", serviceType: "deep-tissue",
    date: "2026-02-25", startTime: "12:00", endTime: "13:30", duration: 90, price: 1400,
    status: "confirmed", createdAt: "2026-02-23T09:00:00Z",
  },
  {
    id: "b15", customerId: "c3", customerName: "James Wong", staffId: "s2", staffName: "Mint",
    staffAvatar: staffMembers[1].avatar,
    serviceId: "srv2", serviceName: "Swedish Relaxation", serviceType: "swedish",
    date: "2026-02-26", startTime: "16:00", endTime: "17:30", duration: 90, price: 1200,
    status: "pending", createdAt: "2026-02-23T10:00:00Z",
  },
]

// ─── Promotions ───────────────────────────────────
export const promotions: Promotion[] = [
  {
    id: "p1", title: "5-Session Package", description: "Buy 5 sessions of any massage type and save 20%. Perfect for building a regular wellness routine.",
    type: "package", discountPercent: 20, sessions: 5, sessionsUsed: 2,
    originalPrice: 5500, promoPrice: 4400,
    validFrom: "2026-01-01", validUntil: "2026-06-30", code: "PACK5",
    isActive: true, badge: "Best Value", color: "green",
    terms: ["Valid for any massage type", "Sessions expire in 6 months", "Non-transferable"],
    applicableServices: ["thai", "swedish", "deep-tissue", "aromatherapy", "hot-stone", "sports", "reflexology", "shiatsu"],
  },
  {
    id: "p2", title: "Happy Hour Special", description: "50% off all bookings between 2-4pm weekdays. Treat yourself to an afternoon escape.",
    type: "happy-hour", discountPercent: 50,
    validFrom: "2026-01-01", validUntil: "2026-12-31",
    isActive: true, badge: "Limited Time", color: "coral",
    terms: ["Weekdays only, 2-4pm slots", "Subject to availability", "Cannot combine with other offers"],
  },
  {
    id: "p3", title: "Discovery Trial", description: "Try 3 different therapists at a special rate. Find your perfect match with our guided trial rotation.",
    type: "trial", discountPercent: 30, sessions: 3, sessionsUsed: 1,
    originalPrice: 3300, promoPrice: 2310,
    validFrom: "2026-02-01", validUntil: "2026-04-30",
    isActive: true, badge: "New", color: "blue",
    terms: ["Must try 3 different therapists", "60-min sessions only", "Rate each session to unlock summary"],
    applicableServices: ["thai", "swedish", "hot-stone"],
  },
  {
    id: "p4", title: "Loyalty Rewards", description: "Earn 1 point per 100 THB spent. Redeem 100 points for a free 60-minute session of your choice.",
    type: "loyalty",
    validFrom: "2026-01-01", validUntil: "2026-12-31",
    isActive: true, badge: "Members", color: "yellow",
    terms: ["Points never expire", "Free session is Thai or Swedish massage", "Upgrade available for point difference"],
  },
  {
    id: "p5", title: "First Timer Welcome", description: "New to Koko? Enjoy your first session at 40% off. Experience the difference quality makes.",
    type: "first-timer", discountPercent: 40,
    validFrom: "2026-01-01", validUntil: "2026-12-31",
    isActive: true, badge: "Welcome", color: "green",
    terms: ["First booking only", "Valid for any service", "One-time use per customer"],
  },
]

// ─── Customers ────────────────────────────────────
export const customers: Customer[] = [
  {
    id: "c1", name: "Alex Chen", email: "alex@example.com", phone: "+66 81 234 5678",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=200&h=200&fit=crop&crop=face",
    memberSince: "2025-06-15", membershipNumber: "MEM-A7X2K9", totalBookings: 24, totalSpent: 28800,
    preferredStaff: ["s1", "s3"], preferredServices: ["thai", "shiatsu"],
    loyaltyPoints: 288, loyaltyStamps: 8, giftCardBalance: 2000, trialActive: false,
  },
  {
    id: "c2", name: "Sarah Kim", email: "sarah@example.com", phone: "+66 92 345 6789",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    memberSince: "2025-09-01", membershipNumber: "MEM-B3P8M2", totalBookings: 15, totalSpent: 17500,
    preferredStaff: ["s2", "s6"], preferredServices: ["swedish", "aromatherapy"],
    loyaltyPoints: 175, loyaltyStamps: 5, giftCardBalance: 0, trialActive: true,
  },
  {
    id: "c3", name: "James Wong", email: "james@example.com", phone: "+66 83 456 7890",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    memberSince: "2025-11-20", membershipNumber: "MEM-C5R1N7", totalBookings: 8, totalSpent: 10400,
    preferredStaff: ["s3", "s5"], preferredServices: ["deep-tissue", "sports"],
    loyaltyPoints: 104, loyaltyStamps: 3, giftCardBalance: 500, trialActive: false,
  },
]

// ─── Trial Rotation ───────────────────────────────
export const activeTrialRotation: TrialRotation = {
  id: "t1", customerId: "c2", totalSessions: 3, completedSessions: 1,
  startDate: "2026-02-10", endDate: "2026-04-10", isActive: true,
  sessions: [
    {
      id: "ts1", staffId: "s2", staffName: "Mint", staffAvatar: staffMembers[1].avatar,
      serviceType: "swedish", date: "2026-02-15", rating: 4,
      feedback: "Very relaxing, loved the essential oils.", isCompleted: true,
    },
    {
      id: "ts2", staffId: "s4", staffName: "Ploy", staffAvatar: staffMembers[3].avatar,
      serviceType: "hot-stone", date: "2026-02-28", isCompleted: false,
    },
    {
      id: "ts3", staffId: "s6", staffName: "Mei", staffAvatar: staffMembers[5].avatar,
      serviceType: "reflexology", date: "2026-03-10", isCompleted: false,
    },
  ],
}

// ─── Dashboard Stats ──────────────────────────────
export const dashboardStats: DashboardStats = {
  todayBookings: 5,
  todayRevenue: 6600,
  occupancyRate: 78,
  avgRating: 4.83,
  weeklyBookings: [
    { day: "Mon", bookings: 8, revenue: 9600 },
    { day: "Tue", bookings: 6, revenue: 7200 },
    { day: "Wed", bookings: 7, revenue: 8400 },
    { day: "Thu", bookings: 5, revenue: 6000 },
    { day: "Fri", bookings: 10, revenue: 13000 },
    { day: "Sat", bookings: 12, revenue: 15600 },
    { day: "Sun", bookings: 6, revenue: 7200 },
  ],
  monthlyRevenue: [
    { month: "Sep", revenue: 52000 },
    { month: "Oct", revenue: 58000 },
    { month: "Nov", revenue: 64000 },
    { month: "Dec", revenue: 71000 },
    { month: "Jan", revenue: 67000 },
    { month: "Feb", revenue: 61000 },
  ],
  topStaff: [
    { name: "Joy", bookings: 48, rating: 4.9 },
    { name: "Ken", bookings: 35, rating: 4.95 },
    { name: "Tong", bookings: 42, rating: 4.85 },
    { name: "Mint", bookings: 38, rating: 4.8 },
  ],
  serviceBreakdown: [
    { type: "Thai Massage", count: 45, revenue: 49500 },
    { type: "Deep Tissue", count: 32, revenue: 44800 },
    { type: "Swedish", count: 28, revenue: 33600 },
    { type: "Hot Stone", count: 20, revenue: 30000 },
    { type: "Sports", count: 15, revenue: 22500 },
    { type: "Aromatherapy", count: 18, revenue: 24300 },
  ],
}

// ─── Time Slots Generator ─────────────────────────
function seededHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function generateTimeSlots(date: string, staffId: string): TimeSlot[] {
  const seed = seededHash(`${date}-${staffId}`)
  const slots: TimeSlot[] = []
  const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  hours.forEach((h, i) => {
    slots.push({
      time: `${h.toString().padStart(2, "0")}:00`,
      available: ((seed + i * 7) % 10) > 2,
    })
    slots.push({
      time: `${h.toString().padStart(2, "0")}:30`,
      available: ((seed + i * 7 + 3) % 10) > 3,
    })
  })
  return slots
}

// ─── Helpers ──────────────────────────────────────
export function getStaffById(id: string) {
  return staffMembers.find((s) => s.id === id)
}
export function getServiceById(id: string) {
  return services.find((s) => s.id === id)
}
export function getCustomerById(id: string) {
  return customers.find((c) => c.id === id)
}
export function getBookingsForStaff(staffId: string) {
  return bookings.filter((b) => b.staffId === staffId)
}
export function getBookingsForDate(date: string) {
  return bookings.filter((b) => b.date === date)
}
export function getUpcomingBookings() {
  const today = new Date().toISOString().split("T")[0]
  return bookings.filter((b) => b.status === "confirmed" && b.date >= today)
}
export function getPastBookings() {
  return bookings.filter((b) => b.status === "completed")
}
export function formatPrice(amount: number, symbol = "฿") {
  return `${symbol}${amount.toLocaleString()}`
}
export function formatMassageType(type: string) {
  return type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

export function generateMembershipNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "MEM-"
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ─── Staff Blocked Dates ───────────────────────────
export const staffBlockedDates: StaffBlockedDate[] = [
  { id: "bd1", staffId: "s1", from: "2026-03-10", to: "2026-03-14", reason: "vacation", note: "Songkran holiday" },
  { id: "bd2", staffId: "s2", from: "2026-03-05", to: "2026-03-05", reason: "day-off", note: "Personal day" },
  { id: "bd3", staffId: "s3", from: "2026-03-20", to: "2026-03-25", reason: "vacation" },
  { id: "bd4", staffId: "s5", from: "2026-03-01", to: "2026-03-02", reason: "day-off" },
]

export function getBlockedDatesForStaff(staffId: string) {
  return staffBlockedDates.filter((b) => b.staffId === staffId)
}

export function getReviewsForStaff(staffId: string) {
  return bookings.filter((b) => b.staffId === staffId && b.rating !== undefined)
}

// ─── Cancellation Policy ─────────────────────────
export const cancellationPolicy: CancellationPolicy = {
  id: "cp1", name: "Standard",
  freeWindowHours: 24,
  lateCancelFeePercent: 50,
  noShowFeePercent: 100,
  staffCompensationPercent: 30,
  isActive: true,
}

export const cancellationRecords: CancellationRecord[] = [
  {
    id: "cr1", bookingId: "b10", customerId: "c1",
    cancelledAt: "2026-02-17T10:00:00Z", reason: "Schedule conflict",
    isLateCancellation: true, fee: 800, staffCompensation: 240, refundAmount: 800,
  },
]

// ─── Client Notes ────────────────────────────────
export const clientNotes: ClientNote[] = [
  {
    id: "cn1", customerId: "c1", authorId: "manager-1", authorName: "Nattawut",
    authorRole: "manager", content: "Prefers firm pressure. Has lower back sensitivity — avoid deep pressure on L4-L5.",
    category: "injury", isPinned: true, createdAt: "2025-08-10T09:00:00Z", updatedAt: "2025-08-10T09:00:00Z",
  },
  {
    id: "cn2", customerId: "c1", authorId: "s1", authorName: "Joy",
    authorRole: "staff", content: "Allergic to eucalyptus oil. Use lavender or citrus blends instead.",
    category: "allergy", isPinned: true, createdAt: "2025-09-05T14:00:00Z", updatedAt: "2025-09-05T14:00:00Z",
  },
  {
    id: "cn3", customerId: "c2", authorId: "manager-1", authorName: "Nattawut",
    authorRole: "manager", content: "VIP customer — always offer complimentary tea service.",
    category: "preference", isPinned: false, createdAt: "2025-10-20T11:00:00Z", updatedAt: "2025-10-20T11:00:00Z",
  },
  {
    id: "cn4", customerId: "c3", authorId: "s5", authorName: "Tong",
    authorRole: "staff", content: "Recovering from rotator cuff surgery (right shoulder). Cleared for gentle massage only on that area.",
    category: "medical", isPinned: true, createdAt: "2026-01-15T16:00:00Z", updatedAt: "2026-01-15T16:00:00Z",
  },
]

// ─── Gift Cards ──────────────────────────────────
export const giftCards: GiftCard[] = [
  {
    id: "gc1", code: "GIFT-AX2K-9M7P", purchasedBy: "c1", purchaserName: "Alex Chen",
    recipientName: "Lisa Chen", recipientEmail: "lisa@example.com",
    message: "Happy Birthday! Treat yourself to a massage.",
    originalBalance: 3000, currentBalance: 3000, applicableServices: "all",
    status: "active", purchasedAt: "2026-02-10T10:00:00Z", expiresAt: "2027-02-10T10:00:00Z",
  },
  {
    id: "gc2", code: "GIFT-BN4R-3H8Q", purchasedBy: "c2", purchaserName: "Sarah Kim",
    recipientName: "Alex Chen", recipientEmail: "alex@example.com",
    message: "Thanks for everything!",
    originalBalance: 2000, currentBalance: 2000, applicableServices: ["thai", "swedish"],
    status: "active", purchasedAt: "2026-01-25T14:00:00Z", expiresAt: "2027-01-25T14:00:00Z",
  },
  {
    id: "gc3", code: "GIFT-CW8T-5K2L",
    recipientName: "James Wong", recipientEmail: "james@example.com",
    originalBalance: 1500, currentBalance: 500, applicableServices: "all",
    status: "active", purchasedAt: "2025-12-01T09:00:00Z", expiresAt: "2026-12-01T09:00:00Z",
    redeemedAt: "2025-12-15T10:00:00Z",
  },
]

// ─── Loyalty Config ──────────────────────────────
export const loyaltyConfig: LoyaltyConfig = {
  pointsPerSpend: 1,
  spendUnit: 100,
  stampsForFreeSession: 10,
  freeSessionServices: ["thai", "swedish", "foot"],
  freeSessionMaxDuration: 60,
  pointRedemptionRate: 10, // 1 point = ฿10 discount
  isActive: true,
  programActive: true,
  stampEnabled: true,
  pointsEnabled: true,
  minRedemptionPoints: 50,
  eligibleStampServices: ["thai", "swedish", "deep-tissue", "aromatherapy", "hot-stone", "sports", "reflexology", "shiatsu", "foot"],
}

export const loyaltyStamps: LoyaltyStamp[] = [
  { id: "ls1", customerId: "c1", bookingId: "b6", earnedAt: "2026-02-22T15:00:00Z", serviceType: "deep-tissue" },
  { id: "ls2", customerId: "c1", bookingId: "b7", earnedAt: "2026-02-21T17:30:00Z", serviceType: "aromatherapy" },
  { id: "ls3", customerId: "c1", bookingId: "b11", earnedAt: "2026-02-17T12:00:00Z", serviceType: "thai" },
  { id: "ls4", customerId: "c2", bookingId: "b8", earnedAt: "2026-02-20T12:00:00Z", serviceType: "reflexology" },
  { id: "ls5", customerId: "c2", bookingId: "b11", earnedAt: "2026-02-17T12:00:00Z", serviceType: "thai" },
  { id: "ls6", customerId: "c3", bookingId: "b6", earnedAt: "2026-02-22T15:00:00Z", serviceType: "deep-tissue" },
  { id: "ls7", customerId: "c3", bookingId: "b9", earnedAt: "2026-02-19T18:30:00Z", serviceType: "sports" },
  { id: "ls8", customerId: "c1", bookingId: "b1", earnedAt: "2026-02-20T10:00:00Z", serviceType: "thai" },
]

export const loyaltyRedemptions: LoyaltyRedemption[] = []

export const loyaltyPointRedemptions: LoyaltyPointRedemption[] = []

// ─── Staff Messages ──────────────────────────────
export const staffMessages: StaffMessage[] = [
  {
    id: "sm1", fromId: "s1", fromName: "Joy", toId: "manager-1", toName: "Nattawut",
    content: "Hi, I need to take March 10-14 off for Songkran. Already submitted the blocked dates.",
    isRead: true, createdAt: "2026-02-18T09:00:00Z",
  },
  {
    id: "sm2", fromId: "manager-1", fromName: "Nattawut", toId: "s1", toName: "Joy",
    content: "Approved! Enjoy your holiday. I'll adjust the schedule.",
    isRead: true, createdAt: "2026-02-18T09:30:00Z",
  },
  {
    id: "sm3", fromId: "s2", fromName: "Mint", toId: "manager-1", toName: "Nattawut",
    content: "The aromatherapy oil stock is running low. Can we reorder the lavender blend?",
    isRead: true, createdAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "sm4", fromId: "manager-1", fromName: "Nattawut", toId: "s2", toName: "Mint",
    content: "Good catch! I'll order it today. Should arrive by Friday.",
    isRead: false, createdAt: "2026-02-20T14:15:00Z",
  },
]

// ─── Promo Session Usages ────────────────────────
export const promoSessionUsages: PromoSessionUsage[] = [
  { id: "psu1", promotionId: "p1", customerId: "c1", bookingId: "b7", sessionNumber: 1, serviceType: "aromatherapy", usedAt: "2026-02-21T16:00:00Z" },
  { id: "psu2", promotionId: "p1", customerId: "c1", bookingId: "b6", sessionNumber: 2, serviceType: "deep-tissue", usedAt: "2026-02-22T14:00:00Z" },
]

// ─── Booking Reminders ───────────────────────────
export const bookingReminders: BookingReminder[] = [
  { id: "br1", bookingId: "b1", customerId: "c1", sentAt: "2026-02-22T10:00:00Z", type: "push", status: "sent" },
  { id: "br2", bookingId: "b2", customerId: "c2", sentAt: "2026-02-22T10:00:00Z", type: "sms", status: "sent" },
]

// ─── Late Arrival Claims ─────────────────────────
export const lateArrivalClaims: LateArrivalClaim[] = [
  {
    id: "lac1", bookingId: "b6", customerId: "c3", staffId: "s1",
    minutesLate: 15, compensationType: "discount", compensationAmount: 150,
    status: "approved", submittedAt: "2026-02-22T14:15:00Z",
    resolvedAt: "2026-02-22T15:00:00Z", resolvedBy: "manager-1",
    customerNote: "Therapist arrived 15 minutes late", managerNote: "Approved - verified with staff",
  },
]

// ─── Purchased Promotions ───────────────────────
export const purchasedPromotions: PurchasedPromotion[] = [
  {
    id: "pp1",
    customerId: "c1",
    promotionId: "p1",
    promotionTitle: "5-Session Thai Package",
    purchasedAt: "2026-02-15",
    paidAmount: 4500,
    services: [
      { serviceType: "thai", completed: true, bookingId: "b3", completedAt: "2026-02-20" },
      { serviceType: "thai", completed: true, bookingId: "b5", completedAt: "2026-02-25" },
      { serviceType: "thai", completed: false },
      { serviceType: "thai", completed: false },
      { serviceType: "thai", completed: false },
    ],
  },
]

// ─── Tip Claims ─────────────────────────────────
export const tipClaims: TipClaim[] = []

// ─── Translation Phrases ────────────────────────
export const translationPhrases: Record<string, Record<string, string>> = {
  english: {
    "More pressure please": "More pressure please",
    "Less pressure please": "Less pressure please",
    "Is the temperature okay?": "Is the temperature okay?",
    "Yes, it feels great": "Yes, it feels great",
    "I have pain here": "I have pain here",
    "Can you focus on my shoulders?": "Can you focus on my shoulders?",
    "Can you focus on my back?": "Can you focus on my back?",
    "Can you focus on my legs?": "Can you focus on my legs?",
    "I'm allergic to nuts": "I'm allergic to nuts",
    "Please use lighter oil": "Please use lighter oil",
    "The room is too cold": "The room is too cold",
    "The room is too warm": "The room is too warm",
    "Thank you": "Thank you",
    "How much time is left?": "How much time is left?",
    "I need a break": "I need a break",
    "That feels wonderful": "That feels wonderful",
    "Can I have some water?": "Can I have some water?",
    "I'm feeling relaxed": "I'm feeling relaxed",
  },
  thai: {
    "More pressure please": "กดแรงขึ้นหน่อยค่ะ",
    "Less pressure please": "กดเบาลงหน่อยค่ะ",
    "Is the temperature okay?": "อุณหภูมิโอเคไหมคะ?",
    "Yes, it feels great": "ค่ะ รู้สึกดีมากค่ะ",
    "I have pain here": "เจ็บตรงนี้ค่ะ",
    "Can you focus on my shoulders?": "ช่วยเน้นที่ไหล่หน่อยได้ไหมคะ?",
    "Can you focus on my back?": "ช่วยเน้นที่หลังหน่อยได้ไหมคะ?",
    "Can you focus on my legs?": "ช่วยเน้นที่ขาหน่อยได้ไหมคะ?",
    "I'm allergic to nuts": "แพ้ถั่วค่ะ",
    "Please use lighter oil": "ใช้น้ำมันเบาๆ หน่อยค่ะ",
    "The room is too cold": "ห้องเย็นเกินไปค่ะ",
    "The room is too warm": "ห้องร้อนเกินไปค่ะ",
    "Thank you": "ขอบคุณค่ะ",
    "How much time is left?": "เหลือเวลาอีกเท่าไหร่คะ?",
    "I need a break": "ขอพักหน่อยค่ะ",
    "That feels wonderful": "รู้สึกดีมากค่ะ",
    "Can I have some water?": "ขอน้ำหน่อยได้ไหมคะ?",
    "I'm feeling relaxed": "รู้สึกผ่อนคลายค่ะ",
  },
  japanese: {
    "More pressure please": "もっと強くお願いします",
    "Less pressure please": "もう少し弱くお願いします",
    "Is the temperature okay?": "温度は大丈夫ですか？",
    "Yes, it feels great": "はい、とても気持ちいいです",
    "I have pain here": "ここが痛いです",
    "Can you focus on my shoulders?": "肩を重点的にお願いします",
    "Can you focus on my back?": "背中を重点的にお願いします",
    "Can you focus on my legs?": "足を重点的にお願いします",
    "I'm allergic to nuts": "ナッツアレルギーです",
    "Please use lighter oil": "軽いオイルを使ってください",
    "The room is too cold": "部屋が寒すぎます",
    "The room is too warm": "部屋が暑すぎます",
    "Thank you": "ありがとうございます",
    "How much time is left?": "残り時間はどのくらいですか？",
    "I need a break": "少し休憩をください",
    "That feels wonderful": "とても気持ちいいです",
    "Can I have some water?": "お水をいただけますか？",
    "I'm feeling relaxed": "リラックスしています",
  },
  mandarin: {
    "More pressure please": "请加大力度",
    "Less pressure please": "请轻一点",
    "Is the temperature okay?": "温度可以吗？",
    "Yes, it feels great": "是的，感觉很好",
    "I have pain here": "这里疼",
    "Can you focus on my shoulders?": "可以重点按摩肩膀吗？",
    "Can you focus on my back?": "可以重点按摩背部吗？",
    "Can you focus on my legs?": "可以重点按摩腿部吗？",
    "I'm allergic to nuts": "我对坚果过敏",
    "Please use lighter oil": "请用清淡的精油",
    "The room is too cold": "房间太冷了",
    "The room is too warm": "房间太热了",
    "Thank you": "谢谢",
    "How much time is left?": "还剩多少时间？",
    "I need a break": "我需要休息一下",
    "That feels wonderful": "感觉太好了",
    "Can I have some water?": "可以给我一杯水吗？",
    "I'm feeling relaxed": "我感觉很放松",
  },
  korean: {
    "More pressure please": "더 세게 해주세요",
    "Less pressure please": "좀 더 약하게 해주세요",
    "Is the temperature okay?": "온도 괜찮으세요?",
    "Yes, it feels great": "네, 아주 좋아요",
    "I have pain here": "여기가 아파요",
    "Can you focus on my shoulders?": "어깨 위주로 해주세요",
    "Can you focus on my back?": "등 위주로 해주세요",
    "Can you focus on my legs?": "다리 위주로 해주세요",
    "I'm allergic to nuts": "견과류 알레르기가 있어요",
    "Please use lighter oil": "가벼운 오일을 사용해주세요",
    "The room is too cold": "방이 너무 추워요",
    "The room is too warm": "방이 너무 더워요",
    "Thank you": "감사합니다",
    "How much time is left?": "시간이 얼마나 남았나요?",
    "I need a break": "잠깐 쉬어야 해요",
    "That feels wonderful": "너무 좋아요",
    "Can I have some water?": "물 좀 주시겠어요?",
    "I'm feeling relaxed": "편안해졌어요",
  },
  german: {
    "More pressure please": "Bitte mehr Druck",
    "Less pressure please": "Bitte weniger Druck",
    "Is the temperature okay?": "Ist die Temperatur in Ordnung?",
    "Yes, it feels great": "Ja, es fühlt sich großartig an",
    "I have pain here": "Hier habe ich Schmerzen",
    "Can you focus on my shoulders?": "Können Sie sich auf meine Schultern konzentrieren?",
    "Can you focus on my back?": "Können Sie sich auf meinen Rücken konzentrieren?",
    "Can you focus on my legs?": "Können Sie sich auf meine Beine konzentrieren?",
    "I'm allergic to nuts": "Ich bin allergisch gegen Nüsse",
    "Please use lighter oil": "Bitte verwenden Sie leichteres Öl",
    "The room is too cold": "Der Raum ist zu kalt",
    "The room is too warm": "Der Raum ist zu warm",
    "Thank you": "Danke schön",
    "How much time is left?": "Wie viel Zeit ist noch übrig?",
    "I need a break": "Ich brauche eine Pause",
    "That feels wonderful": "Das fühlt sich wunderbar an",
    "Can I have some water?": "Kann ich etwas Wasser haben?",
    "I'm feeling relaxed": "Ich fühle mich entspannt",
  },
}

export function mockTranslate(text: string, fromLang: string, toLang: string): string {
  if (fromLang === toLang) return text
  const fromPhrases = translationPhrases[fromLang]
  const toPhrases = translationPhrases[toLang]
  if (fromPhrases && toPhrases) {
    for (const [engKey, localText] of Object.entries(fromPhrases)) {
      if (localText.toLowerCase() === text.toLowerCase()) {
        return toPhrases[engKey] || text
      }
    }
  }
  return `[${toLang}] ${text}`
}
