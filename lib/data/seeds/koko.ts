export {
  staffMembers, services, bookings, promotions, customers,
  activeTrialRotation, dashboardStats, staffBlockedDates,
  cancellationPolicy, cancellationRecords, clientNotes, giftCards,
  loyaltyConfig, loyaltyStamps, loyaltyRedemptions, loyaltyPointRedemptions,
  staffMessages, promoSessionUsages, bookingReminders, lateArrivalClaims,
  purchasedPromotions, tipClaims, translationPhrases,
} from "@/lib/data/mock-data"

import type { ServiceAddOn, MassageRoom } from "@/lib/types"

export const addOns: ServiceAddOn[] = [
  {
    id: "add1", name: "Premium Essential Oils", isActive: true,
    description: "Upgrade to our signature blend of lavender, eucalyptus, and rose oils.",
    price: 150, extraMinutes: 0,
    applicableServices: ["swedish", "thai", "deep-tissue", "sports"],
  },
  {
    id: "add2", name: "Hot Herbal Compress", isActive: true,
    description: "Traditional Thai herbal ball steamed and pressed across the body to release muscle tension.",
    price: 200, extraMinutes: 10,
    applicableServices: ["thai"],
  },
  {
    id: "add3", name: "Scalp & Hair Mask", isActive: true,
    description: "Nourishing coconut-infused scalp massage with a leave-in hair treatment.",
    price: 180, extraMinutes: 15,
    applicableServices: "all",
  },
  {
    id: "add4", name: "Foot Scrub & Soak", isActive: true,
    description: "Exfoliating salt scrub followed by a warm aromatic foot bath before your session.",
    price: 120, extraMinutes: 10,
    applicableServices: "all",
  },
  {
    id: "add5", name: "Back Scrub Upgrade", isActive: true,
    description: "Coffee and coconut sugar exfoliation on the back before your massage begins.",
    price: 160, extraMinutes: 10,
    applicableServices: ["swedish", "deep-tissue", "hot-stone"],
  },
  {
    id: "add6", name: "Extended Reflexology Add-on", isActive: true,
    description: "15 minutes of focused foot reflexology appended to your main session.",
    price: 250, extraMinutes: 15,
    applicableServices: ["thai", "swedish", "deep-tissue", "aromatherapy"],
  },
]

export const rooms: MassageRoom[] = [
  {
    id: "rm1", name: "Room 1", type: "room", capacity: 1, floor: "Ground Floor",
    description: "Standard treatment room with calming ambient lighting.",
    image: "https://images.pexels.com/photos/11774389/pexels-photo-11774389.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm2", name: "Room 2", type: "room", capacity: 1, floor: "Ground Floor",
    description: "Standard treatment room facing the garden.",
    image: "https://images.pexels.com/photos/3865792/pexels-photo-3865792.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm3", name: "Room 3", type: "room", capacity: 1, floor: "Ground Floor",
    description: "Standard treatment room with extra ventilation.",
    image: "https://images.pexels.com/photos/35546242/pexels-photo-35546242.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm4", name: "VIP Suite A", type: "suite", capacity: 1, floor: "1st Floor",
    description: "Luxury private suite with rainfall shower and dedicated relaxation lounge.",
    image: "https://images.pexels.com/photos/5240818/pexels-photo-5240818.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm5", name: "VIP Suite B", type: "suite", capacity: 1, floor: "1st Floor",
    description: "Luxury private suite with panoramic garden view and en-suite bath.",
    image: "https://images.pexels.com/photos/5240808/pexels-photo-5240808.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm6", name: "Couples Suite", type: "couple", capacity: 2, floor: "1st Floor",
    description: "Spacious double-bed room designed for couples sessions side by side.",
    image: "https://images.pexels.com/photos/3760262/pexels-photo-3760262.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm7", name: "Bed 1", type: "bed", capacity: 1, floor: "Ground Floor",
    description: "Open-plan relaxation bed in the main wellness area.",
    image: "https://images.pexels.com/photos/9146378/pexels-photo-9146378.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm8", name: "Bed 2", type: "bed", capacity: 1, floor: "Ground Floor",
    description: "Open-plan relaxation bed in the main wellness area.",
    image: "https://images.pexels.com/photos/6628599/pexels-photo-6628599.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
]
