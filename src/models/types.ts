/**
 * StayPass Domain Models
 * Represents all data entities across Customer, Owner, and Super Admin portals
 */

export type UserRole = 'CUSTOMER' | 'OWNER' | 'ADMIN';

export type GenderType = 'MALE_ONLY' | 'FEMALE_ONLY';
export type PropertyType = 'PG' | 'HOSTEL';
export type StayDuration = 'MONTHLY' | 'DAILY';
export type SharingType = '2-Sharing' | '3-Sharing' | '4-Sharing';
export type BedTier = 'Lower Bunk' | 'Upper Bunk' | 'Single Cot';
export type BedState = 'AVAILABLE' | 'SELECTED' | 'OCCUPIED' | 'UNAVAILABLE';

export type BookingStatus =
  | 'PENDING_OWNER_CONFIRMATION'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT';

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  aadhaarNumberMasked: string;
  cityPreference: 'Hyderabad' | 'Rajahmundry';
  emergencyContact: string;
}

export interface OwnerUser {
  id: string;
  ownerIdCode: string; // e.g. "OWN-HYD-102"
  name: string;
  email: string;
  phone: string;
  propertiesCount: number;
  approvalStatus: 'APPROVED' | 'PENDING_VERIFICATION' | 'REJECTED';
  bankAccountVerified: boolean;
  totalMonthlyRevenue: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN';
  totpEnabled: boolean;
  lastLoginTimestamp: string;
}

export type BedStatus = 'VACANT' | 'BOOKED' | 'OCCUPIED' | 'MAINTENANCE' | 'BLOCKED';

export interface Floor {
  id: string;
  propertyId: string;
  floorNumber: number; // 0 = Ground, 1 = 1st, 2 = 2nd
  floorName: string; // e.g. "Ground Floor", "1st Floor"
  buildingBlock?: string;
  description?: string;
  images?: string[];
  totalRooms: number;
  totalBeds: number;
  createdDate?: string;
}

export interface Bed {
  id: string;
  roomId?: string;
  floorId?: string;
  code: string; // e.g. "Bed 101-A", "101-A"
  tier: BedTier;
  status: BedStatus;
  state: BedState; // kept in sync: VACANT -> 'AVAILABLE', BOOKED/OCCUPIED -> 'OCCUPIED', MAINTENANCE/BLOCKED -> 'UNAVAILABLE'
  monthlyPrice: number;
  dailyPrice: number;
  currentGuestName?: string;
  currentGuestPhone?: string;
  bookingId?: string;
  occupiedSince?: string;
  expectedCheckOut?: string;
  lastUpdated?: string;
  photoUrl?: string;
  maintenanceReason?: string;
  blockedReason?: string;
}

export interface Room {
  id: string;
  propertyId: string;
  floorId?: string;
  floor: string; // e.g. "1st Floor"
  roomNumber: string; // e.g. "Room 101"
  roomName?: string;
  sharingType: SharingType;
  roomType?: 'AC' | 'NON_AC';
  dailyPrice: number;
  monthlyPrice: number;
  description?: string;
  facilities: string[];
  photoUrl?: string;
  images?: string[];
  rules?: string[];
  attachedWashroom: boolean;
  hasAC: boolean;
  beds: Bed[];
}

export interface BedReservation {
  reservationId: string;
  bedId: string;
  bookingId: string;
  startDate: string;
  endDate: string;
  reservationStatus: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
}

export interface BedOccupancy {
  occupancyId: string;
  bedId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  checkInAt: string;
  checkOutAt?: string;
  occupancyStatus: 'ACTIVE' | 'CHECKED_OUT';
}

export interface BedStatusHistory {
  historyId: string;
  bedId: string;
  bedCode: string;
  roomId: string;
  previousStatus: BedStatus;
  newStatus: BedStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface InspectionReport {
  id: string;
  propertyId: string;
  propertyName: string;
  inspectorName: string;
  auditScore: number;
  fireNocVerified: boolean;
  hygieneStatus: 'EXCELLENT' | 'SATISFACTORY' | 'ACTION_REQUIRED';
  cctvWorking: boolean;
  date: string;
  notes: string;
}

export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  name: string;
  gender: GenderType;
  city: 'Hyderabad' | 'Rajahmundry';
  locality: string;
  fullAddress: string;
  type: PropertyType;
  rating: number;
  reviewsCount: number;
  pricePerMonth: number;
  pricePerDay: number;
  availableBeds: number;
  totalBeds: number;
  distance: string;
  verified: boolean;
  coverImage?: string;
  images: string[];
  amenities: string[];
  rules: string[];
  foodProvided: boolean;
  gateClosingTime: string;
  floors?: Floor[];
  rooms: Room[];
  inspectionStatus: 'PASSED' | 'PENDING_AUDIT' | 'NEEDS_REINSPECTION';
  wardenHotline: string;
  latitude?: number;
  longitude?: number;
}



export interface BookingRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGender: 'MALE' | 'FEMALE';
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomNumber: string;
  bedId: string;
  bedCode: string;
  city: string;
  checkInDate: string;
  durationMonths: number;
  durationDays?: number;
  stayType: StayDuration;
  rentAmount: number;
  securityDeposit: number;
  maintenanceFee: number;
  totalEstimatedAmount: number;
  status: BookingStatus;
  createdAt: string;
  ownerNotes?: string;
  isDemo: true;
}

export interface ComplaintTicket {
  id: string;
  propertyId: string;
  propertyName: string;
  customerId: string;
  customerName: string;
  category: 'FOOD_QUALITY' | 'MAINTENANCE_AC' | 'WARDEN_BEHAVIOR' | 'CLEANLINESS' | 'SECURITY';
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED_BY_ADMIN';
  createdAt: string;
  assignedGrievanceOfficer: string;
}

export interface PlatformAnalytics {
  totalProperties: number;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  activeBookingsCount: number;
  pendingOwnerApprovalsCount: number;
  monthlyGrossVolume: number;
  citiesActive: string[];
}

export interface PropertyMetrics {
  propertyId: string;
  propertyName: string;
  city: 'Hyderabad' | 'Rajahmundry';
  locality: string;
  ownerId: string;
  ownerName: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  monthlyRevenue: number;
  commissionGenerated: number;
  averageRating: number;
  resolvedComplaintsRate: number;
  wardenResponseTimeHours: number;
  safetyAuditScore: number;
  inspectionStatus: 'PASSED' | 'PENDING_AUDIT' | 'NEEDS_REINSPECTION';
  bankPayoutStatus: 'CLEARED' | 'PROCESSING';
}

export interface OwnerPerformanceAnalytics {
  currentOccupancy: number;
  previousMonthOccupancy: number;
  occupancyDelta: number;
  grossRentCollected: number;
  securityDepositsHeld: number;
  platformCommission: number;
  netBankPayout: number;
  payoutStatus: 'PROCESSED' | 'PENDING';
  avgResponseTimeHours: number;
  localityBenchmarkOccupancy: number;
  ratingBreakdown: {
    food: number;
    cleanliness: number;
    warden: number;
    wifi: number;
    ac: number;
  };
  upcomingEvents: {
    type: 'CHECK_IN' | 'CHECK_OUT';
    guestName: string;
    bedCode: string;
    date: string;
  }[];
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  ipAddress: string;
  status: 'SUCCESS' | 'BLOCKED_UNAUTHORIZED' | 'CHALLENGE_FAILED';
}

