/**
 * StayPass Repository & API Service Layer
 * Clean abstraction separating Mock Demonstration Repositories from future
 * Django REST Framework production endpoints.
 */

import {
  Property,
  Room,
  Bed,
  BookingRequest,
  ComplaintTicket,
  PlatformAnalytics,
  SecurityAuditLog,
  CustomerUser,
  OwnerUser,
  AdminUser,
  UserRole,
  BedStatusHistory,
  InspectionReport
} from '../models/types';

export interface IStayPassRepository {
  // Customer APIs
  getCities(): Promise<string[]>;
  searchProperties(params: {
    city?: string;
    gender?: 'MALE_ONLY' | 'FEMALE_ONLY';
    query?: string;
    maxPrice?: number;
    sharing?: string;
  }): Promise<Property[]>;
  getPropertyDetails(propertyId: string): Promise<Property | null>;
  getRoomDetails(propertyId: string, roomId: string): Promise<Room | null>;
  createBookingRequest(booking: Omit<BookingRequest, 'id' | 'createdAt' | 'status' | 'isDemo'>): Promise<BookingRequest>;
  getCustomerBookings(customerId: string): Promise<BookingRequest[]>;
  submitComplaint(complaint: Omit<ComplaintTicket, 'id' | 'createdAt' | 'status' | 'assignedGrievanceOfficer'>): Promise<ComplaintTicket>;

  // Owner APIs
  getOwnerProperties(ownerId: string): Promise<Property[]>;
  getOwnerBookings(ownerId: string): Promise<BookingRequest[]>;
  updateBookingStatus(bookingId: string, status: BookingRequest['status'], notes?: string): Promise<boolean>;
  updateBedState(propertyId: string, roomId: string, bedId: string, newState: Bed['state']): Promise<boolean>;
  getOwnerAnalytics(ownerId: string): Promise<{
    occupancyRate: number;
    monthlyRevenue: number;
    pendingRequests: number;
    totalActiveGuests: number;
  }>;

  // Super Admin APIs
  getPlatformAnalytics(): Promise<PlatformAnalytics>;
  getPendingOwnerRegistrations(): Promise<OwnerUser[]>;
  approveOwnerRegistration(ownerId: string, approved: boolean): Promise<boolean>;
  getPendingPropertyVerifications(): Promise<Property[]>;
  approvePropertyVerification(propertyId: string, passed: boolean): Promise<boolean>;
  getAllComplaints(): Promise<ComplaintTicket[]>;
  resolveComplaint(complaintId: string, resolutionNotes: string): Promise<boolean>;
  getSecurityAuditLogs(): Promise<SecurityAuditLog[]>;
}

// ==========================================
// MOCK IMPLEMENTATION (LABEL: DEMO DATA ONLY)
// ==========================================

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    ownerId: 'OWN-HYD-101',
    ownerName: 'Venkata Rao (Warden)',
    ownerPhone: '+91 94401 23456',
    name: "Sri Sai Luxury Men's Executive PG",
    gender: 'MALE_ONLY',
    city: 'Hyderabad',
    locality: 'Gachibowli (Near DLF Cyber City)',
    fullAddress: 'Plot 42, Telecom Nagar, Gachibowli, Hyderabad, Telangana 500032',
    type: 'PG',
    rating: 4.6,
    reviewsCount: 128,
    pricePerMonth: 8500,
    pricePerDay: 500,
    availableBeds: 3,
    totalBeds: 12,
    distance: '0.8 km from DLF Gate 2',
    verified: true,
    coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['High-speed Wi-Fi', 'Daily 3-Time South/North Food', 'Split AC', 'Automatic Laundry', 'Power Backup', 'CCTV 24/7'],
    rules: ['Gate closes strictly at 10:30 PM', 'Alcohol and smoking strictly prohibited', 'Visitors permitted only in ground lobby', 'Silent hours 11:00 PM – 6:00 AM'],
    foodProvided: true,
    gateClosingTime: '10:30 PM',
    inspectionStatus: 'PASSED',
    wardenHotline: '+91 040 4859 2900',
    latitude: 17.4401,
    longitude: 78.3489,
    floors: [
      { id: 'fl-101', propertyId: 'prop-1', floorNumber: 1, floorName: '1st Floor', buildingBlock: 'Main Block', description: 'Executive Deluxe Floor with fiber optic LAN hub', totalRooms: 2, totalBeds: 6 },
      { id: 'fl-102', propertyId: 'prop-1', floorNumber: 2, floorName: '2nd Floor', buildingBlock: 'Main Block', description: 'Quiet Study Floor with balcony access', totalRooms: 1, totalBeds: 4 }
    ],
    rooms: [
      {
        id: 'r-101',
        propertyId: 'prop-1',
        roomNumber: 'Room 101',
        sharingType: '4-Sharing',
        floor: '1st Floor',
        dailyPrice: 500,
        monthlyPrice: 8500,
        description: 'Spacious four-sharing executive room with private balcony, split AC, and personal study tables.',
        facilities: ['Split AC', 'Attached Washroom', 'Individual Wardrobe', 'Balcony', 'Geyser'],
        photoUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80',
        attachedWashroom: true,
        hasAC: true,
        beds: [
          { id: 'b-101-a', roomId: 'r-101', code: 'Bed 101-A', tier: 'Lower Bunk', status: 'VACANT', state: 'AVAILABLE', monthlyPrice: 8500, dailyPrice: 500, lastUpdated: 'Today, 8:00 AM' },
          { id: 'b-101-b', roomId: 'r-101', code: 'Bed 101-B', tier: 'Upper Bunk', status: 'OCCUPIED', state: 'OCCUPIED', monthlyPrice: 8000, dailyPrice: 470, currentGuestName: 'K. Sairam', currentGuestPhone: '+91 98480 33441', occupiedSince: '2026-10-15', lastUpdated: 'Yesterday' },
          { id: 'b-101-c', roomId: 'r-101', code: 'Bed 101-C', tier: 'Lower Bunk', status: 'VACANT', state: 'AVAILABLE', monthlyPrice: 8500, dailyPrice: 500, lastUpdated: 'Today, 8:00 AM' },
          { id: 'b-101-d', roomId: 'r-101', code: 'Bed 101-d', tier: 'Upper Bunk', status: 'BOOKED', state: 'OCCUPIED', monthlyPrice: 8000, dailyPrice: 470, currentGuestName: 'Abhishek V.', bookingId: 'BK-7650', expectedCheckOut: '2027-02-01', lastUpdated: '3 days ago' },
        ],
      },
      {
        id: 'r-102',
        propertyId: 'prop-1',
        roomNumber: 'Room 102',
        sharingType: '2-Sharing',
        floor: '1st Floor',
        dailyPrice: 650,
        monthlyPrice: 11000,
        description: 'Premium two-sharing room with motorized blackout curtains and ergonomic work chairs.',
        facilities: ['Split AC', 'Attached Washroom', 'Study Desk', 'Individual Wardrobe', '24/7 Hot Water'],
        photoUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
        attachedWashroom: true,
        hasAC: true,
        beds: [
          { id: 'b-102-a', roomId: 'r-102', code: 'Bed 102-A', tier: 'Single Cot', status: 'VACANT', state: 'AVAILABLE', monthlyPrice: 11000, dailyPrice: 650, lastUpdated: 'Today, 9:15 AM' },
          { id: 'b-102-b', roomId: 'r-102', code: 'Bed 102-B', tier: 'Single Cot', status: 'OCCUPIED', state: 'OCCUPIED', monthlyPrice: 11000, dailyPrice: 650, currentGuestName: 'Manish Reddy', currentGuestPhone: '+91 97000 88991', occupiedSince: '2026-09-01', lastUpdated: '2 days ago' },
        ],
      },
    ],
  },
  {
    id: 'prop-2',
    ownerId: 'OWN-HYD-102',
    ownerName: 'Subba Rao',
    ownerPhone: '+91 98850 67890',
    name: "SV Executive Men's Coliving PG",
    gender: 'MALE_ONLY',
    city: 'Hyderabad',
    locality: 'Madhapur (Behind Inorbit Mall)',
    fullAddress: 'Ayyappa Society, Main Road, Madhapur, Hyderabad 500081',
    type: 'PG',
    rating: 4.4,
    reviewsCount: 94,
    pricePerMonth: 9500,
    pricePerDay: 550,
    availableBeds: 2,
    totalBeds: 8,
    distance: '1.2 km from Mindspace IT Park',
    verified: true,
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['Wi-Fi 100Mbps', 'Self Cooking & Mess', 'AC', 'Washing Machine', 'Housekeeping'],
    rules: ['Gate closing time 11:00 PM', 'Valid company/college ID required', 'No loud music after 10 PM'],
    foodProvided: true,
    gateClosingTime: '11:00 PM',
    inspectionStatus: 'PASSED',
    wardenHotline: '+91 040 4859 2901',
    latitude: 17.4483,
    longitude: 78.3915,
    floors: [
      { id: 'fl-201', propertyId: 'prop-2', floorNumber: 2, floorName: '2nd Floor', buildingBlock: 'Tower A', description: 'Executive Floor with High Speed LAN', totalRooms: 1, totalBeds: 2 }
    ],
    rooms: [
      {
        id: 'r-201',
        propertyId: 'prop-2',
        roomNumber: 'Room 201',
        sharingType: '2-Sharing',
        floor: '2nd Floor',
        dailyPrice: 550,
        monthlyPrice: 9500,
        description: 'Modern two-sharing room equipped with fiber-optic LAN points.',
        facilities: ['Split AC', 'Attached Washroom', 'High-speed LAN', 'Keycard Access'],
        photoUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
        attachedWashroom: true,
        hasAC: true,
        beds: [
          { id: 'b-201-a', roomId: 'r-201', code: 'Bed 201-A', tier: 'Single Cot', status: 'VACANT', state: 'AVAILABLE', monthlyPrice: 9500, dailyPrice: 550, lastUpdated: 'Today' },
          { id: 'b-201-b', roomId: 'r-201', code: 'Bed 201-B', tier: 'Single Cot', status: 'VACANT', state: 'AVAILABLE', monthlyPrice: 9500, dailyPrice: 550, lastUpdated: 'Today' },
        ],
      },
    ],
  },
  {
    id: 'prop-3',
    ownerId: 'OWN-RJY-201',
    ownerName: 'Satyanarayana Murthy',
    ownerPhone: '+91 94901 12345',
    name: 'Greenwood Youth Hostel (Men)',
    gender: 'MALE_ONLY',
    city: 'Rajahmundry',
    locality: 'Danavaipeta',
    fullAddress: 'Near Subham Kalyana Mandapam, Danavaipeta, Rajahmundry 533103',
    type: 'HOSTEL',
    rating: 4.2,
    reviewsCount: 52,
    pricePerMonth: 5500,
    pricePerDay: 350,
    availableBeds: 5,
    totalBeds: 20,
    distance: '0.5 km from Govt Arts College',
    verified: true,
    coverImage: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['Study Tables', 'Andhra Meals', 'High Speed Wi-Fi', 'Bicycle Parking', 'Mineral Water'],
    rules: ['Gate closing 10:00 PM strictly', 'Compulsory attendance register sign-in', 'No guests in hostel rooms'],
    foodProvided: true,
    gateClosingTime: '10:00 PM',
    inspectionStatus: 'PASSED',
    wardenHotline: '+91 0883 245 7800',
    latitude: 17.0005,
    longitude: 81.7800,
    floors: [
      { id: 'fl-301', propertyId: 'prop-3', floorNumber: 0, floorName: 'Ground Floor', buildingBlock: 'East Block', description: 'Student Study Floor with Dining Hall', totalRooms: 1, totalBeds: 4 }
    ],
    rooms: [
      {
        id: 'r-301',
        propertyId: 'prop-3',
        roomNumber: 'Room 301',
        sharingType: '4-Sharing',
        floor: 'Ground Floor',
        dailyPrice: 350,
        monthlyPrice: 5500,
        description: 'Large airy student room with individual lockable wardrobes and dedicated study lamps.',
        facilities: ['Ceiling Fans', 'Study Lamps', 'Individual Lockers', 'Mineral RO Water'],
        photoUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=600&q=80',
        attachedWashroom: false,
        hasAC: false,
        beds: [
          { id: 'b-301-a', roomId: 'r-301', code: 'Bed 301-A', tier: 'Single Cot', status: 'VACANT', state: 'AVAILABLE', monthlyPrice: 5500, dailyPrice: 350, lastUpdated: 'Today' },
          { id: 'b-301-b', roomId: 'r-301', code: 'Bed 301-B', tier: 'Single Cot', status: 'VACANT', state: 'AVAILABLE', monthlyPrice: 5500, dailyPrice: 350, lastUpdated: 'Today' },
          { id: 'b-301-c', roomId: 'r-301', code: 'Bed 301-C', tier: 'Single Cot', status: 'VACANT', state: 'AVAILABLE', monthlyPrice: 5500, dailyPrice: 350, lastUpdated: 'Today' },
          { id: 'b-301-d', roomId: 'r-301', code: 'Bed 301-D', tier: 'Single Cot', status: 'OCCUPIED', state: 'OCCUPIED', monthlyPrice: 5500, dailyPrice: 350, currentGuestName: 'Ch. Prasad', currentGuestPhone: '+91 98492 77112', occupiedSince: '2026-08-20', lastUpdated: '5 days ago' },
        ],
      },
    ],
  },
  {
    id: 'prop-4',
    ownerId: 'OWN-RJY-202',
    ownerName: 'D. Srinivasa Rao',
    ownerPhone: '+91 99890 33445',
    name: "Godavari Executive Men's PG",
    gender: 'MALE_ONLY',
    city: 'Rajahmundry',
    locality: 'Morampudi Junction',
    fullAddress: 'Beside HP Petrol Bunk, Morampudi, Rajahmundry 533106',
    type: 'PG',
    rating: 4.5,
    reviewsCount: 41,
    pricePerMonth: 6200,
    pricePerDay: 400,
    availableBeds: 2,
    totalBeds: 10,
    distance: '1.0 km from GIET Bus Point',
    verified: true,
    coverImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['Homely Andhra Food', 'Wi-Fi', 'Hot Water Geyser', 'Car/Bike Parking'],
    rules: ['Gate closing time 10:30 PM', 'No external electrical appliances without warden approval'],
    foodProvided: true,
    gateClosingTime: '10:30 PM',
    inspectionStatus: 'PASSED',
    wardenHotline: '+91 0883 245 7801',
    latitude: 16.9890,
    longitude: 81.7920,
    floors: [
      { id: 'fl-401', propertyId: 'prop-4', floorNumber: 1, floorName: '1st Floor', buildingBlock: 'River Wing', description: 'First Floor with Balconies', totalRooms: 1, totalBeds: 3 }
    ],
    rooms: [
      {
        id: 'r-401',
        propertyId: 'prop-4',
        roomNumber: 'Room 401',
        sharingType: '3-Sharing',
        floor: '1st Floor',
        dailyPrice: 400,
        monthlyPrice: 6200,
        description: 'Three-sharing room with direct sunlight and attached western washroom.',
        facilities: ['Attached Washroom', 'Ceiling Fan', 'Personal Wardrobe', 'Balcony'],
        photoUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
        attachedWashroom: true,
        hasAC: false,
        beds: [
          { id: 'b-401-a', roomId: 'r-401', code: 'Bed 401-A', tier: 'Single Cot', status: 'VACANT', state: 'AVAILABLE', monthlyPrice: 6200, dailyPrice: 400, lastUpdated: 'Today' },
          { id: 'b-401-b', roomId: 'r-401', code: 'Bed 401-B', tier: 'Single Cot', status: 'OCCUPIED', state: 'OCCUPIED', monthlyPrice: 6200, dailyPrice: 400, currentGuestName: 'V. Krishna', currentGuestPhone: '+91 94411 99220', occupiedSince: '2026-10-01', lastUpdated: 'Yesterday' },
          { id: 'b-401-c', roomId: 'r-401', code: 'Bed 401-C', tier: 'Single Cot', status: 'VACANT', state: 'AVAILABLE', monthlyPrice: 6200, dailyPrice: 400, lastUpdated: 'Today' },
        ],
      },
    ],
  },
];


export const INITIAL_BOOKINGS: BookingRequest[] = [
  {
    id: 'BK-7821',
    customerId: 'cust-1',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    customerGender: 'MALE',
    propertyId: 'prop-1',
    propertyName: "Sri Sai Luxury Men's Executive PG",
    roomId: 'r-101',
    roomNumber: 'Room 101',
    bedId: 'b-101-a',
    bedCode: 'Cot 1A (Lower Bunk)',
    city: 'Hyderabad, Gachibowli',
    checkInDate: '2026-11-10',
    durationMonths: 1,
    stayType: 'MONTHLY',
    rentAmount: 8500,
    securityDeposit: 5000,
    maintenanceFee: 500,
    totalEstimatedAmount: 14000,
    status: 'PENDING_OWNER_CONFIRMATION',
    createdAt: 'Today, 10:45 AM',
    isDemo: true,
  },
  {
    id: 'BK-7650',
    customerId: 'cust-2',
    customerName: 'K. Sai Teja',
    customerPhone: '+91 98480 11223',
    customerGender: 'MALE',
    propertyId: 'prop-1',
    propertyName: "Sri Sai Luxury Men's Executive PG",
    roomId: 'r-101',
    roomNumber: 'Room 101',
    bedId: 'b-101-b',
    bedCode: 'Cot 1B (Upper Bunk)',
    city: 'Hyderabad, Gachibowli',
    checkInDate: '2026-11-01',
    durationMonths: 3,
    stayType: 'MONTHLY',
    rentAmount: 24000,
    securityDeposit: 5000,
    maintenanceFee: 500,
    totalEstimatedAmount: 29500,
    status: 'CONFIRMED',
    createdAt: '3 days ago',
    isDemo: true,
  },
];

export const INITIAL_PENDING_OWNERS: OwnerUser[] = [
  {
    id: 'own-pending-1',
    ownerIdCode: 'OWN-HYD-104',
    name: 'G. Rama Krishna',
    email: 'ramakrishna.pg@gmail.com',
    phone: '+91 98490 55667',
    propertiesCount: 1,
    approvalStatus: 'PENDING_VERIFICATION',
    bankAccountVerified: true,
    totalMonthlyRevenue: 0,
  },
  {
    id: 'own-pending-2',
    ownerIdCode: 'OWN-RJY-203',
    name: 'B. Venkatapathi Raju',
    email: 'raju.hostel.rjy@gmail.com',
    phone: '+91 94412 88990',
    propertiesCount: 1,
    approvalStatus: 'PENDING_VERIFICATION',
    bankAccountVerified: false,
    totalMonthlyRevenue: 0,
  },
];

export const INITIAL_COMPLAINTS: ComplaintTicket[] = [
  {
    id: 'CMP-101',
    propertyId: 'prop-1',
    propertyName: "Sri Sai Luxury Men's Executive PG",
    customerId: 'cust-1',
    customerName: 'Rahul Sharma',
    category: 'MAINTENANCE_AC',
    description: 'Room 101 split AC cooling is slow; warden requested filter service 2 days ago.',
    status: 'OPEN',
    createdAt: 'Yesterday, 4:20 PM',
    assignedGrievanceOfficer: 'Suresh Varma (Hyderabad West)',
  },
];

export const INITIAL_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-11-04 00:05:12',
    actorEmail: 'superadmin@staypass.com',
    actorRole: 'ADMIN',
    action: 'TOTP_CHALLENGE_VERIFIED',
    ipAddress: '103.24.88.12',
    status: 'SUCCESS',
  },
  {
    id: 'AUD-902',
    timestamp: '2026-11-03 23:51:00',
    actorEmail: 'guest.intruder@unknown.com',
    actorRole: 'CUSTOMER',
    action: 'UNAUTHORIZED_ACCESS_ADMIN_ENDPOINT',
    ipAddress: '185.12.90.4',
    status: 'BLOCKED_UNAUTHORIZED',
  },
  {
    id: 'AUD-903',
    timestamp: '2026-11-03 22:30:15',
    actorEmail: 'venkat.owner@staypass.com',
    actorRole: 'OWNER',
    action: 'OCCUPANCY_STATUS_UPDATED_BED_B101',
    ipAddress: '157.48.20.19',
    status: 'SUCCESS',
  },
];

export const INITIAL_BED_STATUS_HISTORY: BedStatusHistory[] = [
  {
    historyId: 'BSH-101',
    bedId: 'b-101-b',
    bedCode: 'Bed 101-B',
    roomId: 'r-101',
    previousStatus: 'BOOKED',
    newStatus: 'OCCUPIED',
    changedBy: 'Venkata Rao (Warden)',
    changedAt: '2026-10-15 11:30 AM',
    reason: 'Customer K. Sairam physical check-in and biometric activation',
  },
  {
    historyId: 'BSH-102',
    bedId: 'b-101-d',
    bedCode: 'Bed 101-D',
    roomId: 'r-101',
    previousStatus: 'VACANT',
    newStatus: 'BOOKED',
    changedBy: 'System (Reservation Engine)',
    changedAt: '2026-11-01 02:15 PM',
    reason: 'Booking request confirmed for Abhishek V.',
  },
];

export const INITIAL_INSPECTIONS: InspectionReport[] = [
  {
    id: 'INSP-401',
    propertyId: 'prop-1',
    propertyName: "Sri Sai Luxury Men's Executive PG",
    inspectorName: 'Suresh Varma (Govt Ward Inspector)',
    auditScore: 92,
    fireNocVerified: true,
    hygieneStatus: 'EXCELLENT',
    cctvWorking: true,
    date: '2026-10-20',
    notes: 'All 12 fire extinguishers serviced. Kitchen deep cleaned. RO water filter membrane certified.',
  },
  {
    id: 'INSP-402',
    propertyId: 'prop-2',
    propertyName: "SV Executive Men's Coliving PG",
    inspectorName: 'Anil Kumar (Safety Officer)',
    auditScore: 88,
    fireNocVerified: true,
    hygieneStatus: 'SATISFACTORY',
    cctvWorking: true,
    date: '2026-10-18',
    notes: 'Emergency exit signage illuminated. Biometric entry log operational.',
  },
];
