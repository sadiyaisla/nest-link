export type UserRole = 'student' | 'owner' | 'admin';

export type GenderOption = 'Male' | 'Female' | 'Other';
export type HostelGenderOption = 'Male' | 'Female' | 'Co-ed';
export type RoomTypeOption = 'Single' | 'Shared Twin' | '3-Bed Room' | '4-Bed Dorm';

export type SleepSchedule = 'Early Bird' | 'Balanced' | 'Night Owl';
export type CleanlinessLevel = 'Very Tidy' | 'Moderate' | 'Relaxed';
export type StudyHabits = 'Quiet Focus' | 'Collaborative' | 'Flexible';
export type SmokingPreference = 'Non-Smoker' | 'Outside Only' | 'Smoker';
export type FoodPreference = 'Halal / Home-style' | 'Vegetarian' | 'Flexible';

export interface UserPreferences {
  sleepSchedule: SleepSchedule;
  cleanliness: CleanlinessLevel;
  studyHabits: StudyHabits;
  smokingPreference: SmokingPreference;
  foodPreference: FoodPreference;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  university: string;
  department: string;
  semester: string;
  gender: GenderOption;
  budget: number;
  preferredLocation: string;
  verifiedOwner: boolean;
  avatar: string;
  bio: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface HostelFacilities {
  wifi: boolean;
  meals: boolean;
  generator: boolean;
  attachedBathroom: boolean;
  ac: boolean;
  laundry: boolean;
  cctv: boolean;
  studyRoom: boolean;
}

export interface HostelDTO {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerVerified: boolean;
  name: string;
  location: string;
  address: string;
  monthlyRent: number;
  roomTypes: RoomTypeOption[];
  totalBeds: number;
  availableBeds: number;
  genderPreference: HostelGenderOption;
  facilities: HostelFacilities;
  photos: string[];
  description: string;
  rules: string[];
  mealsInfo: string;
  securityInfo: string;
  nearbyUniversities: string[];
  verified: boolean;
  approved: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface RoommateProfileDTO {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  university: string;
  department: string;
  semester: string;
  gender: GenderOption;
  budget: number;
  preferredLocation: string;
  sleepSchedule: SleepSchedule;
  cleanliness: CleanlinessLevel;
  studyHabits: StudyHabits;
  smokingPreference: SmokingPreference;
  foodPreference: FoodPreference;
  bio: string;
  active: boolean;
  createdAt: string;
}

export interface CompatibilityFactorResult {
  factor: string;
  weight: number;
  earned: number;
  status: 'aligned' | 'partial' | 'mismatch';
  reason: string;
}

export type CompatibilityLabel =
  | 'Excellent Match'
  | 'Great Match'
  | 'Potential Match'
  | 'Low Compatibility';

export interface CompatibilityResult {
  score: number;
  label: CompatibilityLabel;
  breakdown: CompatibilityFactorResult[];
  reasons: string[];
}

export interface RoommateWithScore extends RoommateProfileDTO {
  compatibility: CompatibilityResult;
}

export type BookingStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface BookingRequestDTO {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentUniversity: string;
  hostelId: string;
  hostelName: string;
  hostelLocation: string;
  monthlyRent: number;
  ownerId: string;
  roomType: RoomTypeOption;
  moveInDate: string;
  message: string;
  status: BookingStatus;
  ownerNote: string;
  createdAt: string;
}

export interface FavoriteDTO {
  id: string;
  userId: string;
  itemType: 'hostel' | 'roommate';
  itemId: string;
  createdAt: string;
}

export interface ReviewDTO {
  id: string;
  hostelId: string;
  userId: string;
  userName: string;
  userUniversity: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MessageDTO {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientId: string;
  recipientName: string;
  hostelId?: string;
  hostelName?: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface AdminStatsDTO {
  totalStudents: number;
  totalHostels: number;
  totalOwners: number;
  pendingRequests: number;
  pendingHostelApprovals: number;
  verifiedOwners: number;
}

export const BD_LOCATIONS = [
  'Dhanmondi',
  'Mirpur',
  'Uttara',
  'Bashundhara',
  'Mohammadpur',
  'Farmgate',
  'Mohakhali',
  'Chattogram',
] as const;

export const BD_UNIVERSITIES = [
  'University of Dhaka',
  'BUET',
  'North South University',
  'BRAC University',
  'Daffodil International University',
  'United International University',
  'East West University',
  'AUST',
  'University of Chittagong',
  'CUET',
] as const;
