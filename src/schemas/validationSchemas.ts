import { z } from 'zod';

/**
 * Zod Input Validation Schemas for StayPass
 * Implements strict type checking, regex verification, and anti-injection hygiene
 */

// 1. Customer Authentication Schemas
export const CustomerPhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Phone number must be exactly 10 digits starting with 6, 7, 8, or 9'),
  countryCode: z.literal('+91').default('+91'),
});

export const CustomerOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain numbers only'),
});

// 2. PG/Hostel Owner Authentication Schemas
export const OwnerLoginSchema = z.object({
  ownerId: z
    .string()
    .trim()
    .min(5, 'Owner ID must be at least 5 characters')
    .regex(/^OWN-[A-Z]{3}-\d{3,4}$/, 'Format must be OWN-XXX-123 (e.g. OWN-HYD-102)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  otp: z.string().optional(),
});

export const OwnerRegistrationSchema = z.object({
  fullName: z.string().trim().min(3, 'Full name is required'),
  email: z.string().trim().email('Valid email address is required'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, '10-digit mobile number starting 6-9'),
  propertyName: z.string().trim().min(5, 'Property name is required'),
  city: z.enum(['Hyderabad', 'Rajahmundry']),
  locality: z.string().trim().min(3, 'Locality is required'),
  propertyType: z.enum(['PG', 'HOSTEL']),
  genderAllowed: z.enum(['MALE_ONLY', 'FEMALE_ONLY']),
  totalBedsCount: z.number().int().min(4, 'Minimum 4 beds required for listing'),
  tradeLicenseOrAadhaar: z.string().min(5, 'Government registration document ID required'),
});

// 3. Super Admin Authentication (with TOTP Google Authenticator)
export const AdminLoginSchema = z.object({
  email: z.string().trim().email('Authorized admin email required'),
  password: z.string().min(10, 'Admin passwords require at least 10 characters'),
  totpCode: z
    .string()
    .trim()
    .length(6, 'TOTP code must be 6 digits from Google Authenticator')
    .regex(/^\d{6}$/, 'TOTP code must be numeric'),
});

// 4. Booking Request Schema
export const BookingDraftSchema = z.object({
  propertyId: z.string().min(1, 'Property selection is required'),
  roomId: z.string().min(1, 'Room selection is required'),
  bedId: z.string().min(1, 'At least one bed cot must be selected'),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-in date required (YYYY-MM-DD)'),
  stayType: z.enum(['MONTHLY', 'DAILY']),
  durationCount: z.number().int().min(1, 'Duration must be at least 1'),
  customerGender: z.enum(['MALE', 'FEMALE']),
});

// 5. Complaint & Grievance Schema
export const ComplaintSubmissionSchema = z.object({
  propertyId: z.string().min(1),
  category: z.enum(['FOOD_QUALITY', 'MAINTENANCE_AC', 'WARDEN_BEHAVIOR', 'CLEANLINESS', 'SECURITY']),
  description: z.string().trim().min(15, 'Please provide at least 15 characters describing the issue'),
  urgency: z.enum(['NORMAL', 'URGENT_INTERVENTION']).default('NORMAL'),
});

export type CustomerPhoneInput = z.infer<typeof CustomerPhoneSchema>;
export type CustomerOtpInput = z.infer<typeof CustomerOtpSchema>;
export type OwnerLoginInput = z.infer<typeof OwnerLoginSchema>;
export type OwnerRegistrationInput = z.infer<typeof OwnerRegistrationSchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
export type BookingDraftInput = z.infer<typeof BookingDraftSchema>;
export type ComplaintSubmissionInput = z.infer<typeof ComplaintSubmissionSchema>;
