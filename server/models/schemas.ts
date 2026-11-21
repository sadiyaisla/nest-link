import mongoose, { Schema, type Document } from 'mongoose';

// 1. User Model
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'owner' | 'admin';
  phone: string;
  university: string;
  department: string;
  semester: string;
  gender: 'Male' | 'Female' | 'Other';
  budget: number;
  preferredLocation: string;
  verifiedOwner: boolean;
  avatar: string;
  bio: string;
  isDemo?: boolean;
  preferences: {
    sleepSchedule: 'Early Bird' | 'Balanced' | 'Night Owl';
    cleanliness: 'Very Tidy' | 'Moderate' | 'Relaxed';
    studyHabits: 'Quiet Focus' | 'Collaborative' | 'Flexible';
    smokingPreference: 'Non-Smoker' | 'Outside Only' | 'Smoker';
    foodPreference: 'Halal / Home-style' | 'Vegetarian' | 'Flexible';
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'owner', 'admin'], default: 'student' },
    phone: { type: String, default: '' },
    university: { type: String, default: '' },
    department: { type: String, default: '' },
    semester: { type: String, default: '3rd Year' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    budget: { type: Number, default: 6500 },
    preferredLocation: { type: String, default: 'Dhanmondi' },
    verifiedOwner: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
    preferences: {
      sleepSchedule: { type: String, enum: ['Early Bird', 'Balanced', 'Night Owl'], default: 'Balanced' },
      cleanliness: { type: String, enum: ['Very Tidy', 'Moderate', 'Relaxed'], default: 'Moderate' },
      studyHabits: { type: String, enum: ['Quiet Focus', 'Collaborative', 'Flexible'], default: 'Quiet Focus' },
      smokingPreference: { type: String, enum: ['Non-Smoker', 'Outside Only', 'Smoker'], default: 'Non-Smoker' },
      foodPreference: { type: String, enum: ['Halal / Home-style', 'Vegetarian', 'Flexible'], default: 'Halal / Home-style' },
    },
  },
  { timestamps: true }
);

// 2. Hostel Model
export interface IHostel extends Document {
  ownerId: Schema.Types.ObjectId | string;
  name: string;
  location: string;
  address: string;
  monthlyRent: number;
  roomTypes: string[];
  totalBeds: number;
  availableBeds: number;
  genderPreference: 'Male' | 'Female' | 'Co-ed';
  facilities: {
    wifi: boolean;
    meals: boolean;
    generator: boolean;
    attachedBathroom: boolean;
    ac: boolean;
    laundry: boolean;
    cctv: boolean;
    studyRoom: boolean;
  };
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
  createdAt: Date;
}

const HostelSchema = new Schema<IHostel>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, index: true },
    address: { type: String, required: true },
    monthlyRent: { type: Number, required: true, min: 1000 },
    roomTypes: [{ type: String }],
    totalBeds: { type: Number, required: true, min: 1 },
    availableBeds: { type: Number, required: true, min: 0 },
    genderPreference: { type: String, enum: ['Male', 'Female', 'Co-ed'], required: true },
    facilities: {
      wifi: { type: Boolean, default: true },
      meals: { type: Boolean, default: false },
      generator: { type: Boolean, default: false },
      attachedBathroom: { type: Boolean, default: false },
      ac: { type: Boolean, default: false },
      laundry: { type: Boolean, default: false },
      cctv: { type: Boolean, default: true },
      studyRoom: { type: Boolean, default: false },
    },
    photos: [{ type: String }],
    description: { type: String, required: true },
    rules: [{ type: String }],
    mealsInfo: { type: String, default: 'Optional home-style meal plan available.' },
    securityInfo: { type: String, default: '24/7 caretaker and CCTV surveillance.' },
    nearbyUniversities: [{ type: String }],
    verified: { type: Boolean, default: false },
    approved: { type: Boolean, default: true },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 3. RoommateProfile Model
export interface IRoommateProfile extends Document {
  userId: Schema.Types.ObjectId | string;
  name: string;
  avatar: string;
  university: string;
  department: string;
  semester: string;
  gender: 'Male' | 'Female' | 'Other';
  budget: number;
  preferredLocation: string;
  sleepSchedule: 'Early Bird' | 'Balanced' | 'Night Owl';
  cleanliness: 'Very Tidy' | 'Moderate' | 'Relaxed';
  studyHabits: 'Quiet Focus' | 'Collaborative' | 'Flexible';
  smokingPreference: 'Non-Smoker' | 'Outside Only' | 'Smoker';
  foodPreference: 'Halal / Home-style' | 'Vegetarian' | 'Flexible';
  bio: string;
  active: boolean;
  createdAt: Date;
}

const RoommateProfileSchema = new Schema<IRoommateProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    university: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: String, default: '3rd Year' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    budget: { type: Number, required: true },
    preferredLocation: { type: String, required: true },
    sleepSchedule: { type: String, enum: ['Early Bird', 'Balanced', 'Night Owl'], default: 'Balanced' },
    cleanliness: { type: String, enum: ['Very Tidy', 'Moderate', 'Relaxed'], default: 'Moderate' },
    studyHabits: { type: String, enum: ['Quiet Focus', 'Collaborative', 'Flexible'], default: 'Quiet Focus' },
    smokingPreference: { type: String, enum: ['Non-Smoker', 'Outside Only', 'Smoker'], default: 'Non-Smoker' },
    foodPreference: { type: String, enum: ['Halal / Home-style', 'Vegetarian', 'Flexible'], default: 'Halal / Home-style' },
    bio: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 4. BookingRequest Model
export interface IBookingRequest extends Document {
  studentId: Schema.Types.ObjectId | string;
  hostelId: Schema.Types.ObjectId | string;
  ownerId: Schema.Types.ObjectId | string;
  roomType: string;
  moveInDate: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  ownerNote: string;
  createdAt: Date;
}

const BookingRequestSchema = new Schema<IBookingRequest>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roomType: { type: String, required: true },
    moveInDate: { type: String, required: true },
    message: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    ownerNote: { type: String, default: '' },
  },
  { timestamps: true }
);

// 5. Favorite Model
export interface IFavorite extends Document {
  userId: Schema.Types.ObjectId | string;
  itemType: 'hostel' | 'roommate';
  itemId: string;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['hostel', 'roommate'], required: true },
    itemId: { type: String, required: true },
  },
  { timestamps: true }
);
FavoriteSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

// 6. Review Model
export interface IReview extends Document {
  hostelId: Schema.Types.ObjectId | string;
  userId: Schema.Types.ObjectId | string;
  userName: string;
  userUniversity: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userUniversity: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// 7. Message Model
export interface IMessage extends Document {
  senderId: Schema.Types.ObjectId | string;
  senderName: string;
  senderEmail: string;
  recipientId: Schema.Types.ObjectId | string;
  recipientName: string;
  hostelId?: string;
  hostelName?: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientName: { type: String, required: true },
    hostelId: { type: String },
    hostelName: { type: String },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const HostelModel = mongoose.models.Hostel || mongoose.model<IHostel>('Hostel', HostelSchema);
export const RoommateProfileModel =
  mongoose.models.RoommateProfile ||
  mongoose.model<IRoommateProfile>('RoommateProfile', RoommateProfileSchema);
export const BookingRequestModel =
  mongoose.models.BookingRequest ||
  mongoose.model<IBookingRequest>('BookingRequest', BookingRequestSchema);
export const FavoriteModel =
  mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);
export const ReviewModel =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export const MessageModel =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
