import { Property, Room, Bed, BookingRequest, BedStatus } from '../models/types';

export interface DateVacancyFilter {
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
}

export interface BedAvailabilityResult {
  bed: Bed;
  room: Room;
  property: Property;
  isAvailable: boolean;
  status: BedStatus;
  reason?: 'AVAILABLE' | 'OCCUPIED' | 'OVERLAPPING_BOOKING' | 'MAINTENANCE' | 'BLOCKED';
  conflictBookingId?: string;
}

export interface PropertyVacancySummary {
  propertyId: string;
  propertyName: string;
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
  vacantBedsCount: number;
  bookedBedsCount: number;
  occupiedBedsCount: number;
  maintenanceBedsCount: number;
  blockedBedsCount: number;
  dateWiseAvailableBedsCount: number;
  occupancyPercentage: number;
}

/**
 * Checks if two date ranges [startA, endA] and [startB, endB] overlap.
 */
export function areDatesOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  // Overlap condition: startA < endB && endA > startB
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Calculates date-wise availability for all beds in a property given check-in and check-out dates.
 * Enforces business rules:
 * 1. MAINTENANCE beds are strictly unavailable.
 * 2. BLOCKED beds are temporarily disabled by the owner and unavailable.
 * 3. Confirmed bookings overlapping the date range block the bed.
 * 4. Currently OCCUPIED beds cannot be booked for overlapping dates.
 */
export function calculatePropertyDateVacancy(
  property: Property,
  bookings: BookingRequest[],
  dateFilter?: DateVacancyFilter
): BedAvailabilityResult[] {
  const results: BedAvailabilityResult[] = [];
  const activePropertyBookings = bookings.filter(
    (b) => b.propertyId === property.id && (b.status === 'CONFIRMED' || b.status === 'CHECKED_IN')
  );

  const checkIn = dateFilter?.checkInDate || new Date().toISOString().slice(0, 10);
  // Default checkout to 30 days later if not specified
  const checkOut =
    dateFilter?.checkOutDate ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  for (const room of property.rooms) {
    for (const bed of room.beds) {
      // Rule 1: Maintenance
      if (bed.status === 'MAINTENANCE') {
        results.push({
          bed,
          room,
          property,
          isAvailable: false,
          status: 'MAINTENANCE',
          reason: 'MAINTENANCE',
        });
        continue;
      }

      // Rule 2: Blocked by Owner
      if (bed.status === 'BLOCKED') {
        results.push({
          bed,
          room,
          property,
          isAvailable: false,
          status: 'BLOCKED',
          reason: 'BLOCKED',
        });
        continue;
      }

      // Rule 3: Check overlapping confirmed reservations
      const overlappingBooking = activePropertyBookings.find((b) => {
        if (b.bedId !== bed.id) return false;
        const bStart = b.checkInDate;
        // Compute duration-based booking end date
        const bMonths = b.durationMonths || 1;
        const bStartDate = new Date(bStart);
        const bEndDate = new Date(bStartDate.getTime() + bMonths * 30 * 24 * 60 * 60 * 1000);
        const bEnd = bEndDate.toISOString().slice(0, 10);
        return areDatesOverlapping(checkIn, checkOut, bStart, bEnd);
      });

      if (overlappingBooking) {
        results.push({
          bed,
          room,
          property,
          isAvailable: false,
          status: 'BOOKED',
          reason: 'OVERLAPPING_BOOKING',
          conflictBookingId: overlappingBooking.id,
        });
        continue;
      }

      // Rule 4: Currently Occupied with ongoing stay
      if (bed.status === 'OCCUPIED') {
        const occSince = bed.occupiedSince || new Date().toISOString().slice(0, 10);
        const occExpectedOut =
          bed.expectedCheckOut ||
          new Date(new Date(occSince).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        if (areDatesOverlapping(checkIn, checkOut, occSince, occExpectedOut)) {
          results.push({
            bed,
            room,
            property,
            isAvailable: false,
            status: 'OCCUPIED',
            reason: 'OCCUPIED',
          });
          continue;
        }
      }

      // Bed is available for the given date window
      results.push({
        bed,
        room,
        property,
        isAvailable: true,
        status: 'VACANT',
        reason: 'AVAILABLE',
      });
    }
  }

  return results;
}

/**
 * Calculates complete aggregated dashboard vacancy statistics for an owner's property.
 */
export function getPropertyVacancySummary(
  property: Property,
  bookings: BookingRequest[],
  dateFilter?: DateVacancyFilter
): PropertyVacancySummary {
  const allBeds = property.rooms.flatMap((r) => r.beds);
  const totalRooms = property.rooms.length;
  const totalBeds = allBeds.length;
  const totalFloors = property.floors?.length || Math.max(1, new Set(property.rooms.map((r) => r.floor)).size);

  const vacantBedsCount = allBeds.filter((b) => b.status === 'VACANT').length;
  const bookedBedsCount = allBeds.filter((b) => b.status === 'BOOKED').length;
  const occupiedBedsCount = allBeds.filter((b) => b.status === 'OCCUPIED').length;
  const maintenanceBedsCount = allBeds.filter((b) => b.status === 'MAINTENANCE').length;
  const blockedBedsCount = allBeds.filter((b) => b.status === 'BLOCKED').length;

  const dateVacancyResults = calculatePropertyDateVacancy(property, bookings, dateFilter);
  const dateWiseAvailableBedsCount = dateVacancyResults.filter((r) => r.isAvailable).length;

  const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBedsCount / totalBeds) * 100) : 0;

  return {
    propertyId: property.id,
    propertyName: property.name,
    totalFloors,
    totalRooms,
    totalBeds,
    vacantBedsCount,
    bookedBedsCount,
    occupiedBedsCount,
    maintenanceBedsCount,
    blockedBedsCount,
    dateWiseAvailableBedsCount,
    occupancyPercentage,
  };
}
