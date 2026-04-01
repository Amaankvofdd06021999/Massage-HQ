import type {
  StaffMember, ServiceOption, ServiceAddOn, Booking, Promotion,
  Customer, TrialRotation, DashboardStats, StaffBlockedDate,
  CancellationPolicy, CancellationRecord, ClientNote, GiftCard,
  LoyaltyConfig, LoyaltyStamp, LoyaltyRedemption, LoyaltyPointRedemption,
  StaffMessage, PromoSessionUsage, BookingReminder, LateArrivalClaim,
  PurchasedPromotion, TipClaim, MassageRoom,
} from "@/lib/types"

// ─── Staff ────────────────────────────────────────
export const staffMembers: StaffMember[] = [
  {
    id: "ck-s1", name: "Claire Nguyen", nickname: "Claire",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    bio: "Claire is a certified reflexologist with 10 years of experience. Her precise pressure-point technique relieves chronic foot pain and restores energy flow.",
    specialties: ["reflexology", "foot"],
    languages: ["english", "french"],
    yearsExperience: 10, rating: 4.85, totalReviews: 210, pricePerHour: 95,
    availability: {
      mon: { start: "10:00", end: "20:00" }, tue: { start: "10:00", end: "20:00" },
      wed: null, thu: { start: "10:00", end: "20:00" }, fri: { start: "10:00", end: "21:00" },
      sat: { start: "10:00", end: "21:00" }, sun: { start: "11:00", end: "18:00" },
    },
    isAvailableToday: true, isFeatured: true,
    certifications: ["Reflexology Association of Canada (RAC)", "Canadian Therapeutic Massage Board"],
    education: [
      { institution: "Canadian College of Reflexology", qualification: "Advanced Reflexology Diploma", year: 2015 },
      { institution: "Toronto School of Traditional Therapies", qualification: "Foot Therapy Specialist", year: 2017 },
    ],
    highlights: [
      { icon: "massage", label: "Foot Sessions", value: "8,000+" },
      { icon: "repeat", label: "Client Return Rate", value: "95%" },
      { icon: "trophy", label: "Reflexology Specialist", value: "Certified" },
      { icon: "zap", label: "Pressure Zones Mastered", value: "12" },
    ],
    gallery: [],
  },
  {
    id: "ck-s2", name: "Maya Dubois", nickname: "Maya",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    bio: "Maya specialises in foot massage and reflexology. Her gentle yet effective technique is popular with first-time visitors and regulars alike.",
    specialties: ["foot", "reflexology"],
    languages: ["english", "french"],
    yearsExperience: 7, rating: 4.8, totalReviews: 175, pricePerHour: 85,
    availability: {
      mon: { start: "10:00", end: "20:00" }, tue: null, wed: { start: "10:00", end: "20:00" },
      thu: { start: "10:00", end: "20:00" }, fri: { start: "10:00", end: "21:00" },
      sat: { start: "10:00", end: "21:00" }, sun: { start: "11:00", end: "18:00" },
    },
    isAvailableToday: true, isFeatured: true,
    certifications: ["Reflexology Association of Canada", "Ontario College of Reflexology"],
    education: [
      { institution: "Ontario College of Reflexology", qualification: "Reflexology Diploma", year: 2018 },
      { institution: "Vancouver Wellness Institute", qualification: "Foot Therapy Certificate", year: 2019 },
    ],
    highlights: [
      { icon: "heart", label: "Customer Satisfaction", value: "97%" },
      { icon: "star", label: "Average Rating", value: "4.8★" },
      { icon: "globe", label: "Languages Spoken", value: "2" },
      { icon: "award", label: "Top Foot Therapist", value: "2025" },
    ],
    gallery: [],
  },
  {
    id: "ck-s3", name: "James Park", nickname: "James",
    avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200&h=200&fit=crop&crop=face",
    bio: "James combines sports therapy knowledge with advanced reflexology. A former athlete, he understands the importance of foot health for overall well-being.",
    specialties: ["reflexology", "foot"],
    languages: ["english", "korean"],
    yearsExperience: 12, rating: 4.9, totalReviews: 260, pricePerHour: 105,
    availability: {
      mon: { start: "12:00", end: "20:00" }, tue: { start: "10:00", end: "20:00" },
      wed: { start: "10:00", end: "20:00" }, thu: null, fri: { start: "10:00", end: "21:00" },
      sat: { start: "10:00", end: "21:00" }, sun: null,
    },
    isAvailableToday: true, isFeatured: false,
    certifications: ["Reflexology Association of Canada", "Sports Reflexology Certificate"],
    education: [
      { institution: "Canadian College of Massage & Hydrotherapy", qualification: "Registered Massage Therapy", year: 2013 },
      { institution: "Toronto Sports Therapy Centre", qualification: "Sports Reflexology", year: 2016 },
    ],
    highlights: [
      { icon: "massage", label: "Total Sessions", value: "12,000+" },
      { icon: "star", label: "Highest Rated", value: "4.9★" },
      { icon: "trophy", label: "Former Athlete", value: "Hockey" },
      { icon: "zap", label: "Techniques Mastered", value: "8" },
    ],
    gallery: [],
  },
]

// ─── Services ─────────────────────────────────────
export const services: ServiceOption[] = [
  {
    id: "ck-srv1", name: "CK Reflexology", type: "reflexology",
    description: "Expert pressure-point therapy on feet targeting reflex zones linked to organs and systems throughout the body.",
    durations: [{ minutes: 60, price: 85 }, { minutes: 90, price: 120 }],
    isPopular: true, isActive: true,
  },
  {
    id: "ck-srv2", name: "Foot Massage", type: "foot",
    description: "Soothing foot and lower leg massage combining stretching, acupressure, and warm towel wraps for deep relief.",
    durations: [{ minutes: 30, price: 45 }, { minutes: 60, price: 75 }],
    isPopular: true, isActive: true,
  },
]

// ─── Add-ons ─────────────────────────────────────
export const addOns: ServiceAddOn[] = [
  {
    id: "ck-add1", name: "Warm Paraffin Dip", isActive: true,
    description: "Heated paraffin wax treatment for hands or feet to moisturise and soothe.",
    price: 20, extraMinutes: 10,
    applicableServices: ["reflexology", "foot"],
  },
  {
    id: "ck-add2", name: "Foot Scrub & Soak", isActive: true,
    description: "Exfoliating salt scrub followed by a warm aromatic foot bath before your session.",
    price: 15, extraMinutes: 10,
    applicableServices: "all",
  },
]

// ─── Rooms ────────────────────────────────────────
export const rooms: MassageRoom[] = [
  {
    id: "ck-r1", name: "Foot Spa Room", type: "room",
    capacity: 3, floor: "Ground",
    description: "Open-plan room with three reclining chairs for simultaneous foot treatments.",
    isActive: true,
  },
  {
    id: "ck-r2", name: "Treatment Room", type: "room",
    capacity: 1, floor: "Ground",
    description: "Private room for one-on-one reflexology and foot therapy treatments.",
    isActive: true,
  },
]

// ─── Bookings ─────────────────────────────────────
export const bookings: Booking[] = [
  {
    id: "ck-b1", customerId: "c1", customerName: "Alex Chen", staffId: "ck-s1", staffName: "Claire",
    staffAvatar: staffMembers[0].avatar,
    serviceId: "ck-srv1", serviceName: "CK Reflexology", serviceType: "reflexology",
    date: "2026-03-13", startTime: "14:00", endTime: "15:00", duration: 60, price: 85,
    status: "confirmed", createdAt: "2026-03-10T10:30:00Z", roomId: "ck-r1",
  },
  {
    id: "ck-b2", customerId: "c2", customerName: "Sarah Kim", staffId: "ck-s2", staffName: "Maya",
    staffAvatar: staffMembers[1].avatar,
    serviceId: "ck-srv2", serviceName: "Foot Massage", serviceType: "foot",
    date: "2026-03-13", startTime: "11:00", endTime: "12:00", duration: 60, price: 75,
    status: "confirmed", createdAt: "2026-03-09T15:00:00Z", roomId: "ck-r1",
  },
  {
    id: "ck-b3", customerId: "c1", customerName: "Alex Chen", staffId: "ck-s3", staffName: "James",
    staffAvatar: staffMembers[2].avatar,
    serviceId: "ck-srv1", serviceName: "CK Reflexology", serviceType: "reflexology",
    date: "2026-03-12", startTime: "16:00", endTime: "17:30", duration: 90, price: 120,
    status: "completed", rating: 5, review: "James is excellent. Best reflexology session I've had.",
    tip: 20, createdAt: "2026-03-08T09:00:00Z", roomId: "ck-r2",
  },
  {
    id: "ck-b4", customerId: "c2", customerName: "Sarah Kim", staffId: "ck-s1", staffName: "Claire",
    staffAvatar: staffMembers[0].avatar,
    serviceId: "ck-srv1", serviceName: "CK Reflexology", serviceType: "reflexology",
    date: "2026-03-11", startTime: "10:00", endTime: "11:30", duration: 90, price: 120,
    status: "completed", rating: 4, review: "Very thorough reflexology session.",
    tip: 15, createdAt: "2026-03-07T14:00:00Z", roomId: "ck-r1",
  },
  {
    id: "ck-b5", customerId: "c3", customerName: "Liam Tremblay", staffId: "ck-s2", staffName: "Maya",
    staffAvatar: staffMembers[1].avatar,
    serviceId: "ck-srv2", serviceName: "Foot Massage", serviceType: "foot",
    date: "2026-03-14", startTime: "15:00", endTime: "16:00", duration: 60, price: 75,
    status: "pending", createdAt: "2026-03-12T16:00:00Z", roomId: "ck-r1",
  },
]

// ─── Promotions ───────────────────────────────────
export const promotions: Promotion[] = [
  {
    id: "ck-p1", title: "Foot Care Package", description: "Buy 3 reflexology sessions and save 15%. Keep your feet happy.",
    type: "package", discountPercent: 15, sessions: 3, sessionsUsed: 0,
    originalPrice: 255, promoPrice: 217,
    validFrom: "2026-01-01", validUntil: "2026-06-30", code: "FEET3",
    isActive: true, badge: "Popular", color: "green",
    terms: ["Valid for reflexology and foot massage", "Sessions expire in 6 months", "Non-transferable"],
    applicableServices: ["reflexology", "foot"],
  },
  {
    id: "ck-p2", title: "First Visit Special", description: "New to CK Footworks? Enjoy 30% off your first foot treatment.",
    type: "first-timer", discountPercent: 30,
    validFrom: "2026-01-01", validUntil: "2026-12-31",
    isActive: true, badge: "Welcome", color: "coral",
    terms: ["First booking only", "Valid for reflexology or foot massage", "One-time use per customer"],
    applicableServices: ["reflexology", "foot"],
  },
]

// ─── Customers ────────────────────────────────────
export const customers: Customer[] = [
  {
    id: "c1", name: "Alex Chen", email: "alex@example.com", phone: "+1 416 555 0123",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=200&h=200&fit=crop&crop=face",
    memberSince: "2025-06-15", membershipNumber: "MEM-A7X2K9", totalBookings: 4, totalSpent: 410,
    preferredStaff: ["ck-s1", "ck-s3"], preferredServices: ["reflexology"],
    loyaltyPoints: 0, loyaltyStamps: 0, giftCardBalance: 0, trialActive: false,
  },
  {
    id: "c2", name: "Sarah Kim", email: "sarah@example.com", phone: "+1 604 555 0456",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    memberSince: "2025-10-01", membershipNumber: "MEM-B3P8M2", totalBookings: 3, totalSpent: 280,
    preferredStaff: ["ck-s2"], preferredServices: ["foot", "reflexology"],
    loyaltyPoints: 0, loyaltyStamps: 0, giftCardBalance: 0, trialActive: false,
  },
  {
    id: "c3", name: "Liam Tremblay", email: "liam@example.com", phone: "+1 514 555 0789",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=face",
    memberSince: "2025-12-05", membershipNumber: "MEM-D9K3T6", totalBookings: 1, totalSpent: 75,
    preferredStaff: ["ck-s2"], preferredServices: ["foot"],
    loyaltyPoints: 0, loyaltyStamps: 0, giftCardBalance: 0, trialActive: false,
  },
]

// ─── Trial Rotation (not used at CK) ─────────────
export const activeTrialRotation: TrialRotation = {
  id: "ck-t0", customerId: "", totalSessions: 0, completedSessions: 0,
  startDate: "", endDate: "", isActive: false, sessions: [],
}

// ─── Dashboard Stats ──────────────────────────────
export const dashboardStats: DashboardStats = {
  todayBookings: 3,
  todayRevenue: 245,
  occupancyRate: 65,
  avgRating: 4.85,
  weeklyBookings: [
    { day: "Mon", bookings: 5, revenue: 425 },
    { day: "Tue", bookings: 4, revenue: 340 },
    { day: "Wed", bookings: 6, revenue: 510 },
    { day: "Thu", bookings: 4, revenue: 340 },
    { day: "Fri", bookings: 7, revenue: 595 },
    { day: "Sat", bookings: 9, revenue: 810 },
    { day: "Sun", bookings: 4, revenue: 340 },
  ],
  monthlyRevenue: [
    { month: "Oct", revenue: 2800 },
    { month: "Nov", revenue: 3100 },
    { month: "Dec", revenue: 3500 },
    { month: "Jan", revenue: 3200 },
    { month: "Feb", revenue: 2900 },
    { month: "Mar", revenue: 2500 },
  ],
  topStaff: [
    { name: "James", bookings: 32, rating: 4.9 },
    { name: "Claire", bookings: 28, rating: 4.85 },
    { name: "Maya", bookings: 25, rating: 4.8 },
  ],
  serviceBreakdown: [
    { type: "Reflexology", count: 38, revenue: 3230 },
    { type: "Foot Massage", count: 30, revenue: 2250 },
  ],
}

// ─── Staff Blocked Dates ──────────────────────────
export const staffBlockedDates: StaffBlockedDate[] = [
  { id: "ck-bd1", staffId: "ck-s1", from: "2026-03-20", to: "2026-03-22", reason: "vacation", note: "Family visit" },
  { id: "ck-bd2", staffId: "ck-s3", from: "2026-03-15", to: "2026-03-15", reason: "day-off" },
]

// ─── Cancellation Policy ─────────────────────────
export const cancellationPolicy: CancellationPolicy = {
  id: "ck-cp1", name: "Standard",
  freeWindowHours: 12,
  lateCancelFeePercent: 50,
  noShowFeePercent: 100,
  staffCompensationPercent: 25,
  isActive: true,
}

export const cancellationRecords: CancellationRecord[] = []

// ─── Client Notes ────────────────────────────────
export const clientNotes: ClientNote[] = []

// ─── Gift Cards ──────────────────────────────────
export const giftCards: GiftCard[] = [
  {
    id: "ck-gc1", code: "CKFT-AA1B-2C3D", purchasedBy: "c1", purchaserName: "Alex Chen",
    recipientName: "Sarah Kim", recipientEmail: "sarah@example.com",
    message: "Enjoy a foot massage on me!",
    originalBalance: 150, currentBalance: 150, applicableServices: ["reflexology", "foot"],
    status: "active", purchasedAt: "2026-02-20T10:00:00Z", expiresAt: "2027-02-20T10:00:00Z",
  },
  {
    id: "ck-gc2", code: "CKFT-DD4E-5F6G",
    recipientName: "Liam Tremblay", recipientEmail: "liam@example.com",
    originalBalance: 100, currentBalance: 70, applicableServices: "all",
    status: "active", purchasedAt: "2026-01-10T09:00:00Z", expiresAt: "2027-01-10T09:00:00Z",
    redeemedAt: "2026-01-20T14:00:00Z",
  },
]

// ─── Loyalty (not used at CK) ────────────────────
export const loyaltyConfig: LoyaltyConfig = {
  pointsPerSpend: 0, spendUnit: 100, stampsForFreeSession: 10,
  freeSessionServices: [], freeSessionMaxDuration: 60, pointRedemptionRate: 0,
  isActive: false, programActive: false, stampEnabled: false, pointsEnabled: false,
  minRedemptionPoints: 0, eligibleStampServices: [],
}

export const loyaltyStamps: LoyaltyStamp[] = []
export const loyaltyRedemptions: LoyaltyRedemption[] = []
export const loyaltyPointRedemptions: LoyaltyPointRedemption[] = []

// ─── Staff Messages ──────────────────────────────
export const staffMessages: StaffMessage[] = [
  {
    id: "ck-sm1", fromId: "ck-s1", fromName: "Claire", toId: "ck-manager-1", toName: "Manager",
    content: "We are running low on paraffin wax. Can we restock before the weekend?",
    isRead: true, createdAt: "2026-03-10T09:00:00Z",
  },
  {
    id: "ck-sm2", fromId: "ck-manager-1", fromName: "Manager", toId: "ck-s1", toName: "Claire",
    content: "Ordered today. Should arrive Thursday.",
    isRead: false, createdAt: "2026-03-10T09:30:00Z",
  },
  {
    id: "ck-sm3", fromId: "ck-s3", fromName: "James", toId: "ck-manager-1", toName: "Manager",
    content: "I need to take Saturday March 15 off. Already updated the blocked dates.",
    isRead: true, createdAt: "2026-03-08T14:00:00Z",
  },
]

// ─── Promo Session Usages ────────────────────────
export const promoSessionUsages: PromoSessionUsage[] = []

// ─── Booking Reminders ──────────────────────────
export const bookingReminders: BookingReminder[] = []

// ─── Late Arrival Claims ────────────────────────
export const lateArrivalClaims: LateArrivalClaim[] = []

// ─── Purchased Promotions ───────────────────────
export const purchasedPromotions: PurchasedPromotion[] = [
  {
    id: "ck-pp1",
    customerId: "c1",
    promotionId: "ck-p1",
    promotionTitle: "Foot Care Package",
    purchasedAt: "2026-03-01",
    paidAmount: 217,
    services: [
      { serviceType: "reflexology", completed: true, bookingId: "ck-b1", completedAt: "2026-03-05" },
      { serviceType: "foot", completed: false },
      { serviceType: "reflexology", completed: false },
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
    "I have pain here": "I have pain here",
    "Can you focus on my feet?": "Can you focus on my feet?",
    "Thank you": "Thank you",
    "That feels wonderful": "That feels wonderful",
  },
  french: {
    "More pressure please": "Plus de pression s'il vous plaît",
    "Less pressure please": "Moins de pression s'il vous plaît",
    "Is the temperature okay?": "La température est bonne?",
    "I have pain here": "J'ai mal ici",
    "Can you focus on my feet?": "Pouvez-vous vous concentrer sur mes pieds?",
    "Thank you": "Merci",
    "That feels wonderful": "C'est merveilleux",
  },
}
