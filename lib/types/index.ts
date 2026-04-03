// ============================================
// Koko Massage - Core Types
// White-label ready for multi-parlour deployment
// ============================================

// --- Brand / White-Label ---
export interface BrandConfig {
  shopName: string
  tagline: string
  logo: string
  logoIcon: string
  primaryColor: string
  primaryForeground: string
  secondaryColor: string
  accentColor: string
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  borderColor: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  accentGreen: string
  accentCoral: string
  accentYellow: string
  accentBlue: string
  fontFamily: string
  borderRadius: number
  currency: string
  currencySymbol: string
  operatingHours: { open: string; close: string }
  socialLinks: Record<string, string>
}

// --- Staff / Therapist ---
export type MassageType = "thai" | "swedish" | "deep-tissue" | "aromatherapy" | "hot-stone" | "sports" | "reflexology" | "shiatsu" | "foot"
export type Language = "english" | "thai" | "mandarin" | "japanese" | "korean" | "german" | "french" | "russian"
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export interface StaffEducation {
  institution: string
  qualification: string
  year: number
}

export type HighlightIcon = "massage" | "star" | "repeat" | "globe" | "award" | "heart" | "zap" | "trophy"

export interface StaffHighlight {
  icon: HighlightIcon
  label: string
  value: string
}

export interface StaffMember {
  id: string
  name: string
  nickname: string
  avatar: string
  bio: string
  specialties: MassageType[]
  languages: Language[]
  yearsExperience: number
  rating: number
  totalReviews: number
  pricePerHour: number
  availability: Record<DayOfWeek, { start: string; end: string } | null>
  isAvailableToday: boolean
  isFeatured: boolean
  certifications: string[]
  education: StaffEducation[]
  highlights: StaffHighlight[]
  gallery: string[]
}

// --- Services ---
export interface ServiceOption {
  id: string
  name: string
  type: MassageType
  description: string
  durations: { minutes: number; price: number }[]
  isPopular: boolean
  isActive: boolean
}

export interface ServiceAddOn {
  id: string
  name: string
  description: string
  price: number
  extraMinutes: number          // additional time added to session
  applicableServices: MassageType[] | "all"
  isActive: boolean
}

// --- Rooms / Beds ---
export type RoomType = "room" | "bed" | "suite" | "couple"

export interface MassageRoom {
  id: string
  name: string            // "Room 1", "VIP Suite A", "Bed 3"
  type: RoomType
  capacity: number        // 1 = single, 2 = couples
  floor?: string          // "Ground", "1st Floor", etc.
  description?: string
  image?: string           // URL to room/bed photo
  isActive: boolean
}

// --- Bookings ---
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no-show" | "in-progress" | "rejected"

export interface Booking {
  id: string
  customerId: string
  customerName: string
  staffId: string
  staffName: string
  staffAvatar: string
  serviceId: string
  serviceName: string
  serviceType: MassageType
  date: string
  startTime: string
  endTime: string
  duration: number
  price: number
  status: BookingStatus
  notes?: string
  rating?: number
  review?: string
  tip?: number
  tipStatus?: "held" | "claimed" | "paid"
  createdAt: string
  // Extended fields
  cancellationFee?: number
  giftCardId?: string
  giftCardAmount?: number
  promotionId?: string
  promoSessionNumber?: number
  loyaltyStampEarned?: boolean
  lateArrivalClaimId?: string
  rejectionReason?: string
  approvedBy?: string
  approvedAt?: string
  roomId?: string
  guests?: BookingGuest[]
  groupSize?: number
  source?: "online" | "phone"
  addOns?: { addOnId: string; name: string; price: number; extraMinutes: number }[]
}

// --- Booking Guest (for group bookings) ---
export interface BookingGuest {
  id: string
  name: string
  serviceId: string
  serviceName: string
  serviceType: MassageType
  staffId: string
  staffName: string
  staffAvatar: string
  duration: number
  price: number
  roomId?: string
}

// Draft state during booking flow — fields populated progressively per step
export interface BookingGuestDraft {
  id: string
  name: string
  serviceId?: string
  serviceName?: string
  serviceType?: MassageType
  duration?: number
  price?: number
  staffId?: string
  staffName?: string
  staffAvatar?: string
  roomId?: string
}

// --- Staff Blocked Dates ---
export interface StaffBlockedDate {
  id: string
  staffId: string
  from: string   // YYYY-MM-DD
  to: string     // YYYY-MM-DD
  reason: "vacation" | "day-off" | "other"
  note?: string
}

// --- Promotions ---
export type PromoType = "package" | "happy-hour" | "trial" | "loyalty" | "first-timer" | "seasonal"

export interface Promotion {
  id: string
  title: string
  description: string
  type: PromoType
  discountPercent?: number
  discountAmount?: number
  originalPrice?: number
  promoPrice?: number
  sessions?: number
  sessionsUsed?: number
  validFrom: string
  validUntil: string
  code?: string
  isActive: boolean
  badge: string
  color: "green" | "coral" | "yellow" | "blue"
  terms: string[]
  applicableServices?: MassageType[]
}

// --- Customer Preferences ---
export type PressurePreference = "light" | "medium" | "firm" | "deep"

export type PainArea =
  | "neck" | "shoulders" | "upper-back" | "lower-back"
  | "arms" | "hands" | "hips" | "legs" | "knees" | "feet"

export type HealthCondition =
  | "office-syndrome" | "sports-injury" | "chronic-pain"
  | "stress-anxiety" | "insomnia" | "poor-circulation"
  | "muscle-tension" | "post-surgery" | "pregnancy"

export interface MassagePreferences {
  pressurePreference: PressurePreference
  painAreas: PainArea[]
  conditions: HealthCondition[]
  injuries: string[]
}

// --- Customers ---
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  memberSince: string
  membershipNumber: string
  totalBookings: number
  totalSpent: number
  preferredStaff: string[]
  preferredServices: MassageType[]
  loyaltyPoints: number
  loyaltyStamps: number
  giftCardBalance: number
  trialActive: boolean
  notes?: string
  massagePreferences?: MassagePreferences
}

// --- Trial Rotation ---
export interface TrialSession {
  id: string
  staffId: string
  staffName: string
  staffAvatar: string
  serviceType: MassageType
  date: string
  rating?: number
  feedback?: string
  isCompleted: boolean
}

export interface TrialRotation {
  id: string
  customerId: string
  totalSessions: number
  completedSessions: number
  sessions: TrialSession[]
  startDate: string
  endDate: string
  isActive: boolean
}

// --- Time Slots ---
export interface TimeSlot {
  time: string
  available: boolean
}

// --- Dashboard Stats ---
export interface DashboardStats {
  todayBookings: number
  todayRevenue: number
  occupancyRate: number
  avgRating: number
  weeklyBookings: { day: string; bookings: number; revenue: number }[]
  monthlyRevenue: { month: string; revenue: number }[]
  topStaff: { name: string; bookings: number; rating: number }[]
  serviceBreakdown: { type: string; count: number; revenue: number }[]
}

// --- Cancellation ---
export interface CancellationPolicy {
  id: string
  name: string
  freeWindowHours: number
  lateCancelFeePercent: number
  noShowFeePercent: number
  staffCompensationPercent: number
  isActive: boolean
}

export interface CancellationRecord {
  id: string
  bookingId: string
  customerId: string
  cancelledAt: string
  reason?: string
  isLateCancellation: boolean
  fee: number
  staffCompensation: number
  refundAmount: number
}

// --- Client Notes (Private - Staff + Manager) ---
export type NoteCategory = "injury" | "preference" | "allergy" | "general" | "medical" | "warning"

export interface ClientNote {
  id: string
  customerId: string
  authorId: string
  authorName: string
  authorRole: "staff" | "manager"
  content: string
  category: NoteCategory
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

// --- Booking Reminders ---
export interface BookingReminder {
  id: string
  bookingId: string
  customerId: string
  sentAt: string
  type: "email" | "sms" | "push"
  status: "sent" | "pending" | "failed"
}

// --- Late Arrival / Compensation ---
export type CompensationType = "discount" | "credit" | "free-extension"
export type ClaimStatus = "pending" | "approved" | "rejected"

export interface LateArrivalClaim {
  id: string
  bookingId: string
  customerId: string
  staffId: string
  minutesLate: number
  compensationType: CompensationType
  compensationAmount: number
  status: ClaimStatus
  submittedAt: string
  resolvedAt?: string
  resolvedBy?: string
  customerNote?: string
  managerNote?: string
}

// --- Gift Cards ---
export type GiftCardStatus = "active" | "redeemed" | "expired"

export interface GiftCard {
  id: string
  code: string
  purchasedBy?: string
  purchaserName?: string
  recipientName?: string
  recipientEmail?: string
  message?: string
  originalBalance: number
  currentBalance: number
  applicableServices: MassageType[] | "all"
  status: GiftCardStatus
  purchasedAt: string
  expiresAt: string
  redeemedAt?: string
  bookingId?: string
}

// --- Loyalty Program ---
export interface LoyaltyConfig {
  pointsPerSpend: number
  spendUnit: number
  stampsForFreeSession: number
  freeSessionServices: MassageType[]
  freeSessionMaxDuration: number
  pointRedemptionRate: number
  isActive: boolean
  programActive: boolean
  stampEnabled: boolean
  pointsEnabled: boolean
  minRedemptionPoints: number
  eligibleStampServices: MassageType[]
}

export interface LoyaltyStamp {
  id: string
  customerId: string
  bookingId: string
  earnedAt: string
  serviceType: MassageType
}

export interface LoyaltyRedemption {
  id: string
  customerId: string
  stampsUsed: number
  bookingId?: string
  redeemedAt: string
  serviceType: MassageType
  type: "stamp"
}

export interface LoyaltyPointRedemption {
  id: string
  customerId: string
  pointsUsed: number
  bookingId?: string
  discountAmount: number
  redeemedAt: string
  type: "points"
}

// --- Staff Messages ---
export interface StaffMessage {
  id: string
  fromId: string
  fromName: string
  toId: string
  toName: string
  content: string
  isRead: boolean
  createdAt: string
}

// --- Promotion Session Tracking ---
export interface PromoSessionUsage {
  id: string
  promotionId: string
  customerId: string
  bookingId: string
  sessionNumber: number
  serviceType: MassageType
  usedAt: string
}

// --- Purchased Promotions ---
export interface PurchasedPromotion {
  id: string
  customerId: string
  promotionId: string
  promotionTitle: string
  purchasedAt: string
  paidAmount: number
  services: {
    serviceType: MassageType
    completed: boolean
    bookingId?: string
    completedAt?: string
  }[]
}

// --- Tip Claims ---
export type TipClaimStatus = "pending" | "approved" | "rejected"

export interface TipClaim {
  id: string
  staffId: string
  staffName: string
  amount: number
  status: TipClaimStatus
  requestedAt: string
  resolvedAt?: string
  resolvedBy?: string
}

// --- Translation Chat ---
export type ChatLanguage = "english" | "thai" | "mandarin" | "japanese" | "korean" | "german" | "french" | "russian"

export interface TranslationMessage {
  id: string
  bookingId: string
  senderId: string
  senderRole: "customer" | "staff"
  senderName: string
  originalText: string
  translatedText: string
  fromLang: ChatLanguage
  toLang: ChatLanguage
  timestamp: string
}

// --- Navigation ---
export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}
