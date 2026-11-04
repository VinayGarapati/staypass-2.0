import { useState, useEffect } from 'react';
import {
  Property,
  Floor,
  Room,
  Bed,
  BedStatus,
  SharingType,
  BookingRequest,
  ComplaintTicket,
  PlatformAnalytics,
  SecurityAuditLog,
  UserRole,
  CustomerUser,
  OwnerUser,
  AdminUser,
  PropertyMetrics,
  OwnerPerformanceAnalytics,
  BedStatusHistory,
  InspectionReport,
} from '../models/types';
import {
  INITIAL_PROPERTIES,
  INITIAL_BOOKINGS,
  INITIAL_PENDING_OWNERS,
  INITIAL_COMPLAINTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BED_STATUS_HISTORY,
  INITIAL_INSPECTIONS,
} from '../services/apiInterfaces';
import { authService, AuthSession } from '../security/secureStorage';
import {
  calculatePropertyDateVacancy,
  getPropertyVacancySummary,
  BedAvailabilityResult,
  PropertyVacancySummary,
  DateVacancyFilter,
} from '../services/vacancyService';

export interface StayPassAppState {
  // Device Frame Simulation
  devicePlatform: 'android' | 'ios';
  setDevicePlatform: (p: 'android' | 'ios') => void;

  // Active Role Portal
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;

  // Authentication & Sessions
  customerSession: CustomerUser;
  ownerSession: OwnerUser;
  adminSession: AdminUser;
  activeSession: AuthSession | null;
  isAdminTotpVerified: boolean;
  verifyAdminTotp: (code: string) => boolean;
  isOwnerTotpEnrolled: boolean;
  enrollOwnerTotp: (code: string) => boolean;
  rotateSessionToken: () => Promise<void>;
  updateCustomerProfile: (updates: Partial<CustomerUser>) => void;

  // Properties & Live Bed Occupancy State
  properties: Property[];
  updateBedState: (propertyId: string, roomId: string, bedId: string, newState: Bed['state'], guestName?: string) => void;

  // Floor Management
  addFloor: (propertyId: string, floorData: {
    floorNumber: number;
    floorName: string;
    buildingBlock?: string;
    description?: string;
  }) => Floor | null;
  updateFloor: (propertyId: string, floorId: string, data: Partial<Floor>) => void;
  deleteFloor: (propertyId: string, floorId: string) => boolean;

  // Room & Bed Management System
  bedStatusHistory: BedStatusHistory[];
  inspections: InspectionReport[];
  addRoom: (propertyId: string, roomData: {
    roomNumber: string;
    floor: string;
    floorId?: string;
    roomName?: string;
    sharingType: SharingType;
    roomType?: 'AC' | 'NON_AC';
    attachedWashroom: boolean;
    hasAC: boolean;
    dailyPrice: number;
    monthlyPrice: number;
    facilities: string[];
    description?: string;
    photoUrl?: string;
    images?: string[];
  }) => Room | null;
  updateRoom: (propertyId: string, roomId: string, data: Partial<Room>) => void;
  deleteRoom: (propertyId: string, roomId: string) => boolean;
  updateBedStatus: (propertyId: string, roomId: string, bedId: string, newStatus: BedStatus, reason?: string) => boolean;
  checkInGuest: (propertyId: string, roomId: string, bedId: string, guest: {
    name: string;
    phone: string;
    checkInDate: string;
    durationMonths?: number;
    depositAmount?: number;
    bookingId?: string;
  }) => void;
  checkOutGuest: (propertyId: string, roomId: string, bedId: string, checkoutData?: {
    notes?: string;
    depositDeductions?: number;
  }) => boolean;
  addBedToRoom: (propertyId: string, roomId: string, tier?: Bed['tier'], monthlyPrice?: number, dailyPrice?: number) => Bed | null;
  removeBedFromRoom: (propertyId: string, roomId: string, bedId: string) => boolean;
  toggleBedMaintenance: (propertyId: string, roomId: string, bedId: string, reason?: string) => boolean;
  toggleBedBlocked: (propertyId: string, roomId: string, bedId: string, reason?: string) => boolean;

  // Date-wise vacancy calculation
  getDateWiseVacancy: (propertyId: string, checkInDate?: string, checkOutDate?: string) => BedAvailabilityResult[];
  getPropertyVacancySummary: (propertyId: string, checkInDate?: string, checkOutDate?: string) => PropertyVacancySummary;

  // Bookings
  bookings: BookingRequest[];
  createCustomerBooking: (draft: Omit<BookingRequest, 'id' | 'createdAt' | 'status' | 'isDemo'>) => BookingRequest;
  updateBookingStatusByOwner: (bookingId: string, newStatus: BookingRequest['status'], notes?: string) => void;
  cancelCustomerBooking: (bookingId: string, reason?: string) => void;
  syncWithGoogleCalendar: (booking: BookingRequest) => Promise<boolean>;

  // Saved Properties
  savedPropertyIds: string[];
  toggleSavedProperty: (propertyId: string) => void;

  // Complaints & Grievance Tickets
  complaints: ComplaintTicket[];
  submitComplaintTicket: (ticket: Omit<ComplaintTicket, 'id' | 'createdAt' | 'status' | 'assignedGrievanceOfficer'>) => void;
  resolveComplaintTicket: (complaintId: string, resolutionNotes: string) => void;

  // Admin Owner Approval & Inspections
  pendingOwners: OwnerUser[];
  approveOwnerRegistration: (ownerId: string, approve: boolean) => void;
  addInspectionReport: (report: Omit<InspectionReport, 'id' | 'date'>) => InspectionReport;

  // Security Audit Trail
  auditLogs: SecurityAuditLog[];
  recordAuditAction: (action: string, status?: 'SUCCESS' | 'BLOCKED_UNAUTHORIZED') => void;

  // Property Metrics & Owner Performance
  getPropertyMetrics: (propertyId: string) => PropertyMetrics | null;
  getAllPropertyMetrics: () => PropertyMetrics[];
  getOwnerPerformance: (ownerId: string) => OwnerPerformanceAnalytics;

  // Global Toast / Snackbar notification
  toastMessage: string | null;
  showToast: (msg: string) => void;
  dismissToast: () => void;
}

// Global Singleton State Store
let state: {
  devicePlatform: 'android' | 'ios';
  activeRole: UserRole;
  customerSession: CustomerUser;
  ownerSession: OwnerUser;
  adminSession: AdminUser;
  activeSession: AuthSession | null;
  isAdminTotpVerified: boolean;
  isOwnerTotpEnrolled: boolean;
  properties: Property[];
  bookings: BookingRequest[];
  savedPropertyIds: string[];
  complaints: ComplaintTicket[];
  pendingOwners: OwnerUser[];
  auditLogs: SecurityAuditLog[];
  bedStatusHistory: BedStatusHistory[];
  inspections: InspectionReport[];
  toastMessage: string | null;
} = {
  devicePlatform: 'android',
  activeRole: 'CUSTOMER',
  customerSession: {
    id: 'cust-1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    gender: 'MALE',
    kycStatus: 'VERIFIED',
    aadhaarNumberMasked: 'XXXX-XXXX-4921',
    cityPreference: 'Hyderabad',
    emergencyContact: '+91 94401 99887 (Father)',
  },
  ownerSession: {
    id: 'own-1',
    ownerIdCode: 'SP-OWN-000001',
    name: 'Venkata Rao (Warden)',
    email: 'venkata.pg@staypass.com',
    phone: '+91 94401 23456',
    propertiesCount: 1,
    approvalStatus: 'APPROVED',
    bankAccountVerified: true,
    totalMonthlyRevenue: 102000,
  },
  adminSession: {
    id: 'admin-1',
    email: 'garapativinay2001@gmail.com',
    name: 'StayPass Security Operations (Super Admin)',
    role: 'SUPER_ADMIN',
    totpEnabled: true,
    lastLoginTimestamp: '2026-11-04 01:10:00',
  },
  activeSession: {
    accessToken: 'sp_at_cust_7b3a9921_init',
    refreshToken: 'sp_rt_cust_88fc12a9_init',
    role: 'CUSTOMER',
    userId: 'cust-1',
    userEmailOrPhone: '+91 98765 43210',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000,
    refreshExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  },
  isAdminTotpVerified: true,
  isOwnerTotpEnrolled: true,
  properties: INITIAL_PROPERTIES,
  bookings: INITIAL_BOOKINGS,
  savedPropertyIds: ['prop-1'],
  complaints: INITIAL_COMPLAINTS,
  pendingOwners: INITIAL_PENDING_OWNERS,
  auditLogs: INITIAL_AUDIT_LOGS,
  bedStatusHistory: INITIAL_BED_STATUS_HISTORY,
  inspections: INITIAL_INSPECTIONS,
  toastMessage: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function useStayPassStore(): StayPassAppState {
  const [, setTick] = useState(0);

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const showToast = (msg: string) => {
    state.toastMessage = msg;
    notify();
    setTimeout(() => {
      if (state.toastMessage === msg) {
        state.toastMessage = null;
        notify();
      }
    }, 3200);
  };

  const dismissToast = () => {
    state.toastMessage = null;
    notify();
  };

  const setDevicePlatform = (p: 'android' | 'ios') => {
    state.devicePlatform = p;
    notify();
  };

  const setActiveRole = (role: UserRole) => {
    state.activeRole = role;
    const now = Date.now();

    state.activeSession = {
      accessToken: `sp_at_${role.toLowerCase()}_${Math.random().toString(16).slice(2, 10)}`,
      refreshToken: `sp_rt_${role.toLowerCase()}_${Math.random().toString(16).slice(2, 10)}`,
      role,
      userId: role === 'CUSTOMER' ? state.customerSession.id : role === 'OWNER' ? state.ownerSession.id : state.adminSession.id,
      userEmailOrPhone: role === 'CUSTOMER' ? state.customerSession.phone : role === 'OWNER' ? state.ownerSession.email : state.adminSession.email,
      issuedAt: now,
      expiresAt: now + 15 * 60 * 1000,
      refreshExpiresAt: now + 7 * 24 * 60 * 60 * 1000,
      isTotpVerified: role === 'ADMIN' ? state.isAdminTotpVerified : undefined,
    };

    authService.setSecureItem('user_session', JSON.stringify(state.activeSession));

    state.auditLogs = [
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actorEmail: state.activeSession.userEmailOrPhone,
        actorRole: role,
        action: `SESSION_AUTHENTICATED_${role}_TOKEN_ISSUED`,
        ipAddress: '103.24.88.12',
        status: 'SUCCESS',
      },
      ...state.auditLogs,
    ];
    notify();
  };

  const rotateSessionToken = async () => {
    if (!state.activeSession) return;
    try {
      const rotated = await authService.rotateSession(state.activeSession.refreshToken);
      state.activeSession = rotated;
      showToast('Session rotated successfully via SecureStore. New short-lived access token issued.');
      state.auditLogs = [
        {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          actorEmail: state.activeSession.userEmailOrPhone,
          actorRole: state.activeSession.role,
          action: 'TOKEN_ROTATION_EXPO_SECURESTORE_SUCCESS',
          ipAddress: '103.24.88.12',
          status: 'SUCCESS',
        },
        ...state.auditLogs,
      ];
      notify();
    } catch (e: any) {
      showToast(`Token rotation failed: ${e.message}`);
    }
  };

  const updateCustomerProfile = (updates: Partial<CustomerUser>) => {
    state.customerSession = {
      ...state.customerSession,
      ...updates,
    };
    showToast('Customer profile updated successfully.');
    notify();
  };

  const verifyAdminTotp = (code: string): boolean => {
    if (code === '123456' || code.length === 6) {
      state.isAdminTotpVerified = true;
      if (state.activeSession) {
        state.activeSession.isTotpVerified = true;
      }
      showToast('TOTP verified successfully. Super Admin session granted.');
      notify();
      return true;
    }
    showToast('Invalid 6-digit TOTP code. Access denied.');
    return false;
  };

  const enrollOwnerTotp = (code: string): boolean => {
    if (code.length === 6) {
      state.isOwnerTotpEnrolled = true;
      showToast('Google Authenticator 2FA enrolled successfully for Owner portal!');
      notify();
      return true;
    }
    showToast('Invalid 6-digit verification code.');
    return false;
  };

  // FLOOR MANAGEMENT
  const addFloor = (
    propertyId: string,
    floorData: {
      floorNumber: number;
      floorName: string;
      buildingBlock?: string;
      description?: string;
    }
  ): Floor | null => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) {
      showToast('Property not found');
      return null;
    }

    const existingFloors = prop.floors || [];
    const duplicate = existingFloors.some(
      (f) => f.floorName.toLowerCase() === floorData.floorName.trim().toLowerCase()
    );
    if (duplicate) {
      showToast(`Floor "${floorData.floorName}" already exists.`);
      return null;
    }

    const newFloor: Floor = {
      id: `fl-${Date.now().toString().slice(-4)}`,
      propertyId,
      floorNumber: floorData.floorNumber,
      floorName: floorData.floorName.trim(),
      buildingBlock: floorData.buildingBlock || 'Main Block',
      description: floorData.description || `${floorData.floorName} rooms and facilities`,
      totalRooms: 0,
      totalBeds: 0,
      createdDate: new Date().toISOString().slice(0, 10),
    };

    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      return {
        ...p,
        floors: [...(p.floors || []), newFloor],
      };
    });

    showToast(`${newFloor.floorName} added to property.`);
    notify();
    return newFloor;
  };

  const updateFloor = (propertyId: string, floorId: string, data: Partial<Floor>) => {
    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      const updatedFloors = (p.floors || []).map((f) => {
        if (f.id !== floorId) return f;
        return { ...f, ...data };
      });
      return { ...p, floors: updatedFloors };
    });
    showToast('Floor details updated.');
    notify();
  };

  const deleteFloor = (propertyId: string, floorId: string): boolean => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) return false;
    const floor = (prop.floors || []).find((f) => f.id === floorId);
    if (!floor) return false;

    // Check if any room belongs to this floor and has active occupancy or bookings
    const roomsOnFloor = prop.rooms.filter(
      (r) => r.floorId === floorId || r.floor === floor.floorName
    );
    const hasOccupancy = roomsOnFloor.some((r) =>
      r.beds.some((b) => b.status === 'OCCUPIED' || b.status === 'BOOKED')
    );
    if (hasOccupancy) {
      showToast('Cannot delete floor: contains rooms with active residents or booked beds.');
      return false;
    }

    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      return {
        ...p,
        floors: (p.floors || []).filter((f) => f.id !== floorId),
      };
    });

    showToast(`${floor.floorName} deleted.`);
    notify();
    return true;
  };

  // ROOM AND BED MANAGEMENT
  const addRoom = (
    propertyId: string,
    roomData: {
      roomNumber: string;
      floor: string;
      floorId?: string;
      roomName?: string;
      sharingType: SharingType;
      roomType?: 'AC' | 'NON_AC';
      attachedWashroom: boolean;
      hasAC: boolean;
      dailyPrice: number;
      monthlyPrice: number;
      facilities: string[];
      description?: string;
      photoUrl?: string;
      images?: string[];
    }
  ): Room | null => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) {
      showToast('Property not found');
      return null;
    }

    const cleanNum = roomData.roomNumber.trim();
    if (!cleanNum) {
      showToast('Please enter a valid room number');
      return null;
    }

    const exists = prop.rooms.some(
      (r) => r.roomNumber.toLowerCase() === cleanNum.toLowerCase()
    );
    if (exists) {
      showToast(`Room "${cleanNum}" already exists in this property.`);
      return null;
    }

    // Determine bed count based on sharing
    const bedCount = roomData.sharingType === '2-Sharing' ? 2 : roomData.sharingType === '3-Sharing' ? 3 : 4;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const newRoomId = `r-${Date.now().toString().slice(-4)}`;
    const numOnly = cleanNum.replace(/^Room\s*/i, '');

    const generatedBeds: Bed[] = Array.from({ length: bedCount }).map((_, idx) => {
      const letter = letters[idx];
      const tier: Bed['tier'] =
        roomData.sharingType === '2-Sharing'
          ? 'Single Cot'
          : idx % 2 === 0
          ? 'Lower Bunk'
          : 'Upper Bunk';
      return {
        id: `b-${newRoomId}-${letter.toLowerCase()}`,
        roomId: newRoomId,
        code: `${numOnly}-${letter}`,
        tier,
        status: 'VACANT',
        state: 'AVAILABLE',
        monthlyPrice: roomData.monthlyPrice,
        dailyPrice: roomData.dailyPrice,
        lastUpdated: 'Just added',
      };
    });

    const newRoom: Room = {
      id: newRoomId,
      propertyId,
      floorId: roomData.floorId,
      roomNumber: cleanNum.startsWith('Room') ? cleanNum : `Room ${cleanNum}`,
      roomName: roomData.roomName,
      sharingType: roomData.sharingType,
      roomType: roomData.roomType || (roomData.hasAC ? 'AC' : 'NON_AC'),
      floor: roomData.floor || '1st Floor',
      dailyPrice: roomData.dailyPrice,
      monthlyPrice: roomData.monthlyPrice,
      description: roomData.description || `${roomData.sharingType} room with essential PG amenities.`,
      facilities: roomData.facilities.length > 0 ? roomData.facilities : ['Attached Washroom', 'Ceiling Fan'],
      photoUrl: roomData.photoUrl || 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80',
      attachedWashroom: roomData.attachedWashroom,
      hasAC: roomData.hasAC,
      beds: generatedBeds,
    };

    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      const updatedRooms = [...p.rooms, newRoom];
      const totalBeds = updatedRooms.reduce((acc, r) => acc + r.beds.length, 0);
      const availableBeds = updatedRooms.reduce(
        (acc, r) => acc + r.beds.filter((b) => b.status === 'VACANT').length,
        0
      );
      return {
        ...p,
        rooms: updatedRooms,
        totalBeds,
        availableBeds,
      };
    });

    showToast(`${newRoom.roomNumber} created with ${bedCount} beds ready for occupancy!`);
    notify();
    return newRoom;
  };

  const updateRoom = (propertyId: string, roomId: string, data: Partial<Room>) => {
    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      const updatedRooms = p.rooms.map((r) => {
        if (r.id !== roomId) return r;
        return { ...r, ...data };
      });
      return { ...p, rooms: updatedRooms };
    });
    showToast('Room details updated.');
    notify();
  };

  const deleteRoom = (propertyId: string, roomId: string): boolean => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) return false;
    const room = prop.rooms.find((r) => r.id === roomId);
    if (!room) return false;

    const hasActiveGuests = room.beds.some(
      (b) => b.status === 'OCCUPIED' || b.status === 'BOOKED'
    );
    if (hasActiveGuests) {
      showToast('Cannot delete room: active residents or booked beds exist. Check out guests first.');
      return false;
    }

    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      const updatedRooms = p.rooms.filter((r) => r.id !== roomId);
      const totalBeds = updatedRooms.reduce((acc, r) => acc + r.beds.length, 0);
      const availableBeds = updatedRooms.reduce(
        (acc, r) => acc + r.beds.filter((b) => b.status === 'VACANT').length,
        0
      );
      return { ...p, rooms: updatedRooms, totalBeds, availableBeds };
    });

    showToast(`Room ${room.roomNumber} removed.`);
    notify();
    return true;
  };

  const updateBedStatus = (
    propertyId: string,
    roomId: string,
    bedId: string,
    newStatus: BedStatus,
    reason?: string
  ): boolean => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) return false;
    const room = prop.rooms.find((r) => r.id === roomId);
    if (!room) return false;
    const bed = room.beds.find((b) => b.id === bedId);
    if (!bed) return false;

    // Strict Rule: Cannot directly flip from OCCUPIED to VACANT without checkout workflow
    if (bed.status === 'OCCUPIED' && newStatus === 'VACANT') {
      showToast('Notice: Active guest must be checked out through the Check-Out Guest action for proper deposit settlement.');
      return false;
    }

    const previousStatus = bed.status;
    const nowIso = new Date().toISOString();

    let mappedState: Bed['state'] = 'AVAILABLE';
    if (newStatus === 'OCCUPIED' || newStatus === 'BOOKED') {
      mappedState = 'OCCUPIED';
    } else if (newStatus === 'MAINTENANCE' || newStatus === 'BLOCKED') {
      mappedState = 'UNAVAILABLE';
    }

    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      const updatedRooms = p.rooms.map((r) => {
        if (r.id !== roomId) return r;
        const updatedBeds = r.beds.map((b) => {
          if (b.id !== bedId) return b;
          return {
            ...b,
            status: newStatus,
            state: mappedState,
            lastUpdated: 'Just now',
          };
        });
        return { ...r, beds: updatedBeds };
      });

      const totalBeds = updatedRooms.reduce((acc, r) => acc + r.beds.length, 0);
      const availableBeds = updatedRooms.reduce(
        (acc, r) => acc + r.beds.filter((b) => b.status === 'VACANT').length,
        0
      );

      return { ...p, rooms: updatedRooms, totalBeds, availableBeds };
    });

    const historyEntry: BedStatusHistory = {
      historyId: `HIS-${Date.now().toString().slice(-5)}`,
      bedId,
      bedCode: bed.code,
      roomId,
      previousStatus,
      newStatus,
      changedBy: state.ownerSession.name,
      changedAt: nowIso.replace('T', ' ').slice(0, 19),
      reason: reason || `Status updated from ${previousStatus} to ${newStatus}`,
    };
    state.bedStatusHistory = [historyEntry, ...state.bedStatusHistory];

    showToast(`${bed.code} status changed to ${newStatus}`);
    notify();
    return true;
  };

  const updateBedState = (
    propertyId: string,
    roomId: string,
    bedId: string,
    newState: Bed['state'],
    guestName?: string
  ) => {
    let mappedStatus: BedStatus = 'VACANT';
    if (newState === 'UNAVAILABLE') mappedStatus = 'MAINTENANCE';
    else if (newState === 'SELECTED') mappedStatus = 'BOOKED';
    else mappedStatus = 'VACANT';

    updateBedStatus(propertyId, roomId, bedId, mappedStatus, guestName ? `Guest: ${guestName}` : undefined);
  };


  const toggleBedMaintenance = (
    propertyId: string,
    roomId: string,
    bedId: string,
    reason?: string
  ): boolean => {
    const prop = state.properties.find((p) => p.id === propertyId);
    const room = prop?.rooms.find((r) => r.id === roomId);
    const bed = room?.beds.find((b) => b.id === bedId);
    if (!bed) return false;

    if (bed.status === 'OCCUPIED') {
      showToast('Cannot mark an occupied bed for maintenance. Check out guest first.');
      return false;
    }

    const nextStatus = bed.status === 'MAINTENANCE' ? 'VACANT' : 'MAINTENANCE';
    return updateBedStatus(
      propertyId,
      roomId,
      bedId,
      nextStatus,
      reason || (nextStatus === 'MAINTENANCE' ? 'Maintenance initiated' : 'Maintenance completed')
    );
  };

  const toggleBedBlocked = (
    propertyId: string,
    roomId: string,
    bedId: string,
    reason?: string
  ): boolean => {
    const prop = state.properties.find((p) => p.id === propertyId);
    const room = prop?.rooms.find((r) => r.id === roomId);
    const bed = room?.beds.find((b) => b.id === bedId);
    if (!bed) return false;

    if (bed.status === 'OCCUPIED') {
      showToast('Cannot block an occupied bed. Check out guest first.');
      return false;
    }

    const nextStatus = bed.status === 'BLOCKED' ? 'VACANT' : 'BLOCKED';
    return updateBedStatus(
      propertyId,
      roomId,
      bedId,
      nextStatus,
      reason || (nextStatus === 'BLOCKED' ? 'Bed temporarily blocked by owner' : 'Bed unblocked by owner')
    );
  };

  const checkInGuest = (
    propertyId: string,
    roomId: string,
    bedId: string,
    guest: {
      name: string;
      phone: string;
      checkInDate: string;
      durationMonths?: number;
      depositAmount?: number;
      bookingId?: string;
    }
  ) => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) return;
    const room = prop.rooms.find((r) => r.id === roomId);
    if (!room) return;
    const bed = room.beds.find((b) => b.id === bedId);
    if (!bed) return;

    const previousStatus = bed.status;
    const checkInDate = guest.checkInDate || new Date().toISOString().slice(0, 10);

    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      const updatedRooms = p.rooms.map((r) => {
        if (r.id !== roomId) return r;
        const updatedBeds = r.beds.map((b) => {
          if (b.id !== bedId) return b;
          return {
            ...b,
            status: 'OCCUPIED' as BedStatus,
            state: 'OCCUPIED' as Bed['state'],
            currentGuestName: guest.name,
            currentGuestPhone: guest.phone,
            occupiedSince: checkInDate,
            bookingId: guest.bookingId,
            lastUpdated: 'Checked in today',
          };
        });
        return { ...r, beds: updatedBeds };
      });

      const totalBeds = updatedRooms.reduce((acc, r) => acc + r.beds.length, 0);
      const availableBeds = updatedRooms.reduce(
        (acc, r) => acc + r.beds.filter((b) => b.status === 'VACANT').length,
        0
      );

      return { ...p, rooms: updatedRooms, totalBeds, availableBeds };
    });

    if (guest.bookingId) {
      state.bookings = state.bookings.map((b) =>
        b.id === guest.bookingId ? { ...b, status: 'CHECKED_IN' } : b
      );
    }

    const historyEntry: BedStatusHistory = {
      historyId: `HIS-${Date.now().toString().slice(-5)}`,
      bedId,
      bedCode: bed.code,
      roomId,
      previousStatus,
      newStatus: 'OCCUPIED',
      changedBy: state.ownerSession.name,
      changedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      reason: `Guest Check-In: ${guest.name} (${guest.phone})`,
    };
    state.bedStatusHistory = [historyEntry, ...state.bedStatusHistory];

    showToast(`Guest ${guest.name} successfully checked into ${bed.code}!`);
    notify();
  };

  const checkOutGuest = (
    propertyId: string,
    roomId: string,
    bedId: string,
    checkoutData?: {
      notes?: string;
      depositDeductions?: number;
    }
  ): boolean => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) return false;
    const room = prop.rooms.find((r) => r.id === roomId);
    if (!room) return false;
    const bed = room.beds.find((b) => b.id === bedId);
    if (!bed) return false;

    if (bed.status !== 'OCCUPIED') {
      showToast('Cannot check out: this bed is not currently occupied.');
      return false;
    }

    const previousGuest = bed.currentGuestName || 'Resident';
    const previousStatus = bed.status;

    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      const updatedRooms = p.rooms.map((r) => {
        if (r.id !== roomId) return r;
        const updatedBeds = r.beds.map((b) => {
          if (b.id !== bedId) return b;
          return {
            ...b,
            status: 'VACANT' as BedStatus,
            state: 'AVAILABLE' as Bed['state'],
            currentGuestName: undefined,
            currentGuestPhone: undefined,
            occupiedSince: undefined,
            bookingId: undefined,
            lastUpdated: 'Checked out just now',
          };
        });
        return { ...r, beds: updatedBeds };
      });

      const totalBeds = updatedRooms.reduce((acc, r) => acc + r.beds.length, 0);
      const availableBeds = updatedRooms.reduce(
        (acc, r) => acc + r.beds.filter((b) => b.status === 'VACANT').length,
        0
      );

      return { ...p, rooms: updatedRooms, totalBeds, availableBeds };
    });

    if (bed.bookingId) {
      state.bookings = state.bookings.map((b) =>
        b.id === bed.bookingId ? { ...b, status: 'CHECKED_OUT' } : b
      );
    }

    const historyEntry: BedStatusHistory = {
      historyId: `HIS-${Date.now().toString().slice(-5)}`,
      bedId,
      bedCode: bed.code,
      roomId,
      previousStatus,
      newStatus: 'VACANT',
      changedBy: state.ownerSession.name,
      changedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      reason: `Guest Check-Out completed for ${previousGuest}. Notes: ${checkoutData?.notes || 'Room inspection passed, deposit cleared'}`,
    };
    state.bedStatusHistory = [historyEntry, ...state.bedStatusHistory];

    showToast(`Check-out completed for ${previousGuest}. ${bed.code} is now vacant.`);
    notify();
    return true;
  };

  const addBedToRoom = (
    propertyId: string,
    roomId: string,
    tier: Bed['tier'] = 'Single Cot',
    monthlyPrice?: number,
    dailyPrice?: number
  ): Bed | null => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) return null;
    const room = prop.rooms.find((r) => r.id === roomId);
    if (!room) return null;

    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const nextIdx = room.beds.length;
    const nextLetter = letters[nextIdx] || `${nextIdx + 1}`;
    const cleanRoomNum = room.roomNumber.replace(/^Room\s*/i, '').trim();

    const newBed: Bed = {
      id: `b-${roomId}-${nextLetter.toLowerCase()}`,
      roomId,
      code: `${cleanRoomNum}-${nextLetter}`,
      tier,
      status: 'VACANT',
      state: 'AVAILABLE',
      monthlyPrice: monthlyPrice || room.monthlyPrice,
      dailyPrice: dailyPrice || room.dailyPrice,
      lastUpdated: 'Just added',
    };

    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      const updatedRooms = p.rooms.map((r) => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          beds: [...r.beds, newBed],
        };
      });
      const totalBeds = updatedRooms.reduce((acc, r) => acc + r.beds.length, 0);
      const availableBeds = updatedRooms.reduce(
        (acc, r) => acc + r.beds.filter((b) => b.status === 'VACANT').length,
        0
      );
      return { ...p, rooms: updatedRooms, totalBeds, availableBeds };
    });

    showToast(`${newBed.code} added to ${room.roomNumber}`);
    notify();
    return newBed;
  };

  const removeBedFromRoom = (
    propertyId: string,
    roomId: string,
    bedId: string
  ): boolean => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) return false;
    const room = prop.rooms.find((r) => r.id === roomId);
    if (!room) return false;
    const bed = room.beds.find((b) => b.id === bedId);
    if (!bed) return false;

    if (bed.status === 'OCCUPIED' || bed.status === 'BOOKED') {
      showToast('Cannot remove bed: currently occupied or reserved.');
      return false;
    }

    state.properties = state.properties.map((p) => {
      if (p.id !== propertyId) return p;
      const updatedRooms = p.rooms.map((r) => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          beds: r.beds.filter((b) => b.id !== bedId),
        };
      });
      const totalBeds = updatedRooms.reduce((acc, r) => acc + r.beds.length, 0);
      const availableBeds = updatedRooms.reduce(
        (acc, r) => acc + r.beds.filter((b) => b.status === 'VACANT').length,
        0
      );
      return { ...p, rooms: updatedRooms, totalBeds, availableBeds };
    });

    showToast(`${bed.code} removed from ${room.roomNumber}`);
    notify();
    return true;
  };

  // DATE-WISE VACANCY CALCULATION
  const getDateWiseVacancy = (
    propertyId: string,
    checkInDate?: string,
    checkOutDate?: string
  ): BedAvailabilityResult[] => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) return [];
    return calculatePropertyDateVacancy(
      prop,
      state.bookings,
      checkInDate && checkOutDate ? { checkInDate, checkOutDate } : undefined
    );
  };

  const getPropertyVacancySummaryData = (
    propertyId: string,
    checkInDate?: string,
    checkOutDate?: string
  ): PropertyVacancySummary => {
    const prop = state.properties.find((p) => p.id === propertyId) || state.properties[0];
    return getPropertyVacancySummary(
      prop,
      state.bookings,
      checkInDate && checkOutDate ? { checkInDate, checkOutDate } : undefined
    );
  };

  const createCustomerBooking = (
    draft: Omit<BookingRequest, 'id' | 'createdAt' | 'status' | 'isDemo'>
  ): BookingRequest => {
    const newBooking: BookingRequest = {
      ...draft,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING_OWNER_CONFIRMATION',
      createdAt: 'Just now',
      isDemo: true,
    };

    state.bookings = [newBooking, ...state.bookings];
    showToast(`Bed booking request ${newBooking.id} sent to property warden!`);
    notify();
    return newBooking;
  };

  const updateBookingStatusByOwner = (
    bookingId: string,
    newStatus: BookingRequest['status'],
    notes?: string
  ) => {
    state.bookings = state.bookings.map((b) => {
      if (b.id !== bookingId) return b;
      return {
        ...b,
        status: newStatus,
        ownerNotes: notes,
      };
    });

    const booking = state.bookings.find((b) => b.id === bookingId);
    if (booking && newStatus === 'CONFIRMED') {
      updateBedStatus(
        booking.propertyId,
        booking.roomId,
        booking.bedId,
        'BOOKED',
        `Confirmed online booking ${bookingId} for ${booking.customerName}`
      );
    }

    showToast(`Booking ${bookingId} updated to ${newStatus}`);
    notify();
  };

  const cancelCustomerBooking = (bookingId: string, reason?: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    state.bookings = state.bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
    );

    if (booking.bedId && booking.propertyId && booking.roomId) {
      updateBedStatus(
        booking.propertyId,
        booking.roomId,
        booking.bedId,
        'VACANT',
        reason || 'Booking cancelled by customer'
      );
    }

    showToast(`Booking ${bookingId} cancelled.`);
    notify();
  };

  const syncWithGoogleCalendar = async (booking: BookingRequest): Promise<boolean> => {
    try {
      await new Promise((res) => setTimeout(res, 400));
      showToast(
        `Added to Google Calendar: Check-in at ${booking.propertyName} on ${booking.checkInDate} (10:00 AM)`
      );
      return true;
    } catch {
      showToast('Failed to sync with Google Calendar.');
      return false;
    }
  };

  const toggleSavedProperty = (propertyId: string) => {
    if (state.savedPropertyIds.includes(propertyId)) {
      state.savedPropertyIds = state.savedPropertyIds.filter((id) => id !== propertyId);
      showToast('Removed from saved stays');
    } else {
      state.savedPropertyIds = [...state.savedPropertyIds, propertyId];
      showToast('Property bookmarked');
    }
    notify();
  };

  const submitComplaintTicket = (
    ticket: Omit<ComplaintTicket, 'id' | 'createdAt' | 'status' | 'assignedGrievanceOfficer'>
  ) => {
    const newComplaint: ComplaintTicket = {
      ...ticket,
      id: `CMP-${Math.floor(200 + Math.random() * 800)}`,
      status: 'OPEN',
      createdAt: 'Just now',
      assignedGrievanceOfficer: 'City Warden Grievance Cell',
    };
    state.complaints = [newComplaint, ...state.complaints];
    showToast('Complaint ticket logged for admin review.');
    notify();
  };

  const resolveComplaintTicket = (complaintId: string, resolutionNotes: string) => {
    state.complaints = state.complaints.map((c) => {
      if (c.id !== complaintId) return c;
      return {
        ...c,
        status: 'RESOLVED_BY_ADMIN',
        description: `${c.description} [Resolution: ${resolutionNotes}]`,
      };
    });
    showToast(`Complaint ${complaintId} marked resolved.`);
    notify();
  };

  const approveOwnerRegistration = (ownerId: string, approve: boolean) => {
    state.pendingOwners = state.pendingOwners.filter((o) => o.id !== ownerId);
    showToast(
      approve
        ? `Owner approved and issued unique ID code SP-OWN-00000${Math.floor(1 + Math.random() * 9)}`
        : 'Owner application rejected due to non-compliance'
    );
    notify();
  };

  const addInspectionReport = (
    report: Omit<InspectionReport, 'id' | 'date'>
  ): InspectionReport => {
    const newReport: InspectionReport = {
      ...report,
      id: `INSP-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().slice(0, 10),
    };

    state.inspections = [newReport, ...state.inspections];
    state.properties = state.properties.map((p) => {
      if (p.id !== report.propertyId) return p;
      return {
        ...p,
        inspectionStatus: report.auditScore >= 80 ? 'PASSED' : 'NEEDS_REINSPECTION',
      };
    });

    showToast(`Inspection report filed for ${report.propertyName}. Score: ${report.auditScore}/100`);
    notify();
    return newReport;
  };

  const recordAuditAction = (
    action: string,
    auditStatus: 'SUCCESS' | 'BLOCKED_UNAUTHORIZED' = 'SUCCESS'
  ) => {
    state.auditLogs = [
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actorEmail: state.adminSession.email,
        actorRole: 'ADMIN',
        action,
        ipAddress: '103.24.88.12',
        status: auditStatus,
      },
      ...state.auditLogs,
    ];
    notify();
  };

  // Metrics for individual PG/Hostel
  const getPropertyMetrics = (propertyId: string): PropertyMetrics | null => {
    const prop = state.properties.find((p) => p.id === propertyId);
    if (!prop) return null;

    const totalBeds = prop.totalBeds;
    const availableBeds = prop.availableBeds;
    const occupiedBeds = totalBeds - availableBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const monthlyRevenue = occupiedBeds * prop.pricePerMonth;
    const commissionGenerated = Math.round(monthlyRevenue * 0.03);

    const propComplaints = state.complaints.filter((c) => c.propertyId === propertyId);
    const resolvedRate =
      propComplaints.length > 0
        ? Math.round(
            (propComplaints.filter((c) => c.status === 'RESOLVED_BY_ADMIN').length / propComplaints.length) * 100
          )
        : 100;

    return {
      propertyId: prop.id,
      propertyName: prop.name,
      city: prop.city,
      locality: prop.locality,
      ownerId: prop.ownerId,
      ownerName: prop.ownerName,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate,
      monthlyRevenue,
      commissionGenerated,
      averageRating: prop.rating,
      resolvedComplaintsRate: resolvedRate,
      wardenResponseTimeHours: prop.city === 'Hyderabad' ? 1.4 : 1.8,
      safetyAuditScore: prop.inspectionStatus === 'PASSED' ? 98 : 75,
      inspectionStatus: prop.inspectionStatus,
      bankPayoutStatus: 'CLEARED',
    };
  };

  const getAllPropertyMetrics = (): PropertyMetrics[] => {
    return state.properties.map((p) => getPropertyMetrics(p.id)!);
  };

  // Owner Performance Analytics
  const getOwnerPerformance = (ownerId: string): OwnerPerformanceAnalytics => {
    const prop = state.properties.find((p) => p.ownerId === ownerId) || state.properties[0];
    const metrics = getPropertyMetrics(prop.id)!;

    const grossRent = metrics.monthlyRevenue;
    const depositsHeld = metrics.occupiedBeds * 5000;
    const commission = metrics.commissionGenerated;
    const netPayout = grossRent - commission;

    return {
      currentOccupancy: metrics.occupancyRate,
      previousMonthOccupancy: 68,
      occupancyDelta: metrics.occupancyRate - 68,
      grossRentCollected: grossRent,
      securityDepositsHeld: depositsHeld,
      platformCommission: commission,
      netBankPayout: netPayout,
      payoutStatus: 'PROCESSED',
      avgResponseTimeHours: metrics.wardenResponseTimeHours,
      localityBenchmarkOccupancy: prop.city === 'Hyderabad' ? 72 : 65,
      ratingBreakdown: {
        food: 4.6,
        cleanliness: 4.8,
        warden: 4.9,
        wifi: 4.5,
        ac: 4.4,
      },
      upcomingEvents: [
        {
          type: 'CHECK_IN',
          guestName: 'Rahul Sharma',
          bedCode: '101-A (Room 101)',
          date: '10 Nov 2026',
        },
        {
          type: 'CHECK_OUT',
          guestName: 'Abhishek V.',
          bedCode: '101-D (Room 101)',
          date: '15 Nov 2026',
        },
      ],
    };
  };

  return {
    devicePlatform: state.devicePlatform,
    setDevicePlatform,
    activeRole: state.activeRole,
    setActiveRole,
    customerSession: state.customerSession,
    ownerSession: state.ownerSession,
    adminSession: state.adminSession,
    activeSession: state.activeSession,
    isAdminTotpVerified: state.isAdminTotpVerified,
    verifyAdminTotp,
    isOwnerTotpEnrolled: state.isOwnerTotpEnrolled,
    enrollOwnerTotp,
    rotateSessionToken,
    updateCustomerProfile,
    properties: state.properties,
    updateBedState,
    bedStatusHistory: state.bedStatusHistory,
    inspections: state.inspections,
    addFloor,
    updateFloor,
    deleteFloor,
    addRoom,
    updateRoom,
    deleteRoom,
    updateBedStatus,
    checkInGuest,
    checkOutGuest,
    addBedToRoom,
    removeBedFromRoom,
    toggleBedMaintenance,
    toggleBedBlocked,
    getDateWiseVacancy,
    getPropertyVacancySummary: getPropertyVacancySummaryData,
    bookings: state.bookings,
    createCustomerBooking,
    updateBookingStatusByOwner,
    cancelCustomerBooking,
    syncWithGoogleCalendar,
    savedPropertyIds: state.savedPropertyIds,
    toggleSavedProperty,
    complaints: state.complaints,
    submitComplaintTicket,
    resolveComplaintTicket,
    pendingOwners: state.pendingOwners,
    approveOwnerRegistration,
    addInspectionReport,
    auditLogs: state.auditLogs,
    recordAuditAction,
    getPropertyMetrics,
    getAllPropertyMetrics,
    getOwnerPerformance,
    toastMessage: state.toastMessage,
    showToast,
    dismissToast,
  };
}
