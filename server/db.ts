import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import type {
  AdminStatsDTO,
  BookingRequestDTO,
  BookingStatus,
  FavoriteDTO,
  HostelDTO,
  MessageDTO,
  ReviewDTO,
  RoommateProfileDTO,
  UserDTO,
  UserRole,
} from '../shared/types.ts';
import {
  BookingRequestModel,
  FavoriteModel,
  HostelModel,
  MessageModel,
  ReviewModel,
  RoommateProfileModel,
  UserModel,
} from './models/schemas.ts';

const IMG_DHANMONDI = '/src/assets/images/hostel_dhanmondi_room_1795240128171.jpg';
const IMG_BASHUNDHARA = '/src/assets/images/hostel_bashundhara_exterior_1795240127758.jpg';
const IMG_UTTARA = '/src/assets/images/hostel_uttara_studio_1795240128257.jpg';
const IMG_CHATTOGRAM = '/src/assets/images/hostel_chattogram_lounge_1795240128578.jpg';
const IMG_HERO = '/src/assets/images/hero_student_hostel_1795240129892.jpg';
const AVATAR_MALE = '/src/assets/images/student_avatar_male_1795240129490.jpg';
const AVATAR_FEMALE = '/src/assets/images/student_avatar_female_1795240128922.jpg';

export interface StoredUser extends UserDTO {
  passwordHash: string;
  isDemo?: boolean;
}

interface LocalDatabase {
  users: StoredUser[];
  hostels: HostelDTO[];
  roommates: RoommateProfileDTO[];
  bookings: BookingRequestDTO[];
  favorites: FavoriteDTO[];
  reviews: ReviewDTO[];
  messages: MessageDTO[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nestlink-db.json');

let useMongo = false;
let localData: LocalDatabase = {
  users: [],
  hostels: [],
  roommates: [],
  bookings: [],
  favorites: [],
  reviews: [],
  messages: [],
};

function newId(): string {
  return new mongoose.Types.ObjectId().toString();
}

function saveLocalData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(localData, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

function buildSeedData(): LocalDatabase {
  const now = new Date().toISOString();
  // Demo accounts use non-guessable random hashes; interactive demo sign-in uses /api/auth/demo (restricted to student/owner).
  const demoHash = bcrypt.hashSync(crypto.randomBytes(24).toString('hex'), 8);

  const studentDemoId = newId();
  const owner1Id = newId();
  const owner2Id = newId();
  const owner3Id = newId();

  const stu2Id = newId();
  const stu3Id = newId();
  const stu4Id = newId();
  const stu5Id = newId();
  const stu6Id = newId();
  const stu7Id = newId();
  const stu8Id = newId();

  const users: StoredUser[] = [
    {
      id: studentDemoId,
      name: 'Rafiul Islam',
      email: 'rafi@du.ac.bd',
      passwordHash: demoHash,
      role: 'student',
      phone: '01712345678',
      university: 'University of Dhaka',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      gender: 'Male',
      budget: 6500,
      preferredLocation: 'Dhanmondi',
      verifiedOwner: false,
      avatar: AVATAR_MALE,
      bio: 'CSE undergrad at DU looking for a quiet, tidy twin-share room near Dhanmondi or Farmgate with reliable Wi-Fi.',
      isDemo: true,
      preferences: {
        sleepSchedule: 'Balanced',
        cleanliness: 'Very Tidy',
        studyHabits: 'Quiet Focus',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Halal / Home-style',
      },
      createdAt: now,
    },
    {
      id: owner1Id,
      name: 'Karim Uddin',
      email: 'karim@nestlink.bd',
      passwordHash: demoHash,
      role: 'owner',
      phone: '01811223344',
      university: '',
      department: '',
      semester: '',
      gender: 'Male',
      budget: 0,
      preferredLocation: 'Dhanmondi',
      verifiedOwner: true,
      avatar: AVATAR_MALE,
      bio: 'Managing safe, verified student residences in Dhanmondi and Farmgate since 2018.',
      isDemo: true,
      preferences: {
        sleepSchedule: 'Early Bird',
        cleanliness: 'Very Tidy',
        studyHabits: 'Quiet Focus',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Halal / Home-style',
      },
      createdAt: now,
    },
    {
      id: owner2Id,
      name: 'Farhana Yasmin',
      email: 'farhana.residences@nestlink.bd',
      passwordHash: demoHash,
      role: 'owner',
      phone: '01911445566',
      university: '',
      department: '',
      semester: '',
      gender: 'Female',
      budget: 0,
      preferredLocation: 'Bashundhara',
      verifiedOwner: true,
      avatar: AVATAR_FEMALE,
      bio: 'Dedicated female student accommodation host near NSU and IUB.',
      isDemo: false,
      preferences: {
        sleepSchedule: 'Early Bird',
        cleanliness: 'Very Tidy',
        studyHabits: 'Quiet Focus',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Halal / Home-style',
      },
      createdAt: now,
    },
    {
      id: owner3Id,
      name: 'Mahmudul Hasan',
      email: 'mahmud.chattogram@nestlink.bd',
      passwordHash: demoHash,
      role: 'owner',
      phone: '01611778899',
      university: '',
      department: '',
      semester: '',
      gender: 'Male',
      budget: 0,
      preferredLocation: 'Chattogram',
      verifiedOwner: false,
      avatar: AVATAR_MALE,
      bio: 'Hostel manager serving CUET and Chittagong University students in Nasirabad.',
      isDemo: false,
      preferences: {
        sleepSchedule: 'Balanced',
        cleanliness: 'Moderate',
        studyHabits: 'Flexible',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Halal / Home-style',
      },
      createdAt: now,
    },
    {
      id: stu2Id,
      name: 'Nusrat Jahan Mim',
      email: 'nusrat.mim@northsouth.edu',
      passwordHash: demoHash,
      role: 'student',
      phone: '01755667788',
      university: 'North South University',
      department: 'BBA (Finance)',
      semester: '5th Semester',
      gender: 'Female',
      budget: 8000,
      preferredLocation: 'Bashundhara',
      verifiedOwner: false,
      avatar: AVATAR_FEMALE,
      bio: 'NSU finance student who enjoys morning classes, organized desks, and home-cooked dinners.',
      preferences: {
        sleepSchedule: 'Early Bird',
        cleanliness: 'Very Tidy',
        studyHabits: 'Quiet Focus',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Halal / Home-style',
      },
      createdAt: now,
    },
    {
      id: stu3Id,
      name: 'Tanvir Ahmed',
      email: 'tanvir.buet@buet.ac.bd',
      passwordHash: demoHash,
      role: 'student',
      phone: '01799887766',
      university: 'BUET',
      department: 'Electrical & Electronic Engineering',
      semester: '4th Year',
      gender: 'Male',
      budget: 6000,
      preferredLocation: 'Dhanmondi',
      verifiedOwner: false,
      avatar: AVATAR_MALE,
      bio: 'Final-year EEE student working on embedded projects. Balanced sleeper, neat desk, respectful of quiet hours.',
      preferences: {
        sleepSchedule: 'Balanced',
        cleanliness: 'Very Tidy',
        studyHabits: 'Quiet Focus',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Halal / Home-style',
      },
      createdAt: now,
    },
    {
      id: stu4Id,
      name: 'Sadia Afrin',
      email: 'sadia.bracu@bracu.ac.bd',
      passwordHash: demoHash,
      role: 'student',
      phone: '01822334455',
      university: 'BRAC University',
      department: 'Architecture',
      semester: '7th Semester',
      gender: 'Female',
      budget: 8500,
      preferredLocation: 'Mohakhali',
      verifiedOwner: false,
      avatar: AVATAR_FEMALE,
      bio: 'Architecture student often sketching late before jury weeks. Friendly, collaborative, and loves clean common areas.',
      preferences: {
        sleepSchedule: 'Night Owl',
        cleanliness: 'Moderate',
        studyHabits: 'Collaborative',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Flexible',
      },
      createdAt: now,
    },
    {
      id: stu5Id,
      name: 'Mehedi Hasan Shuvo',
      email: 'shuvo.diu@diu.edu.bd',
      passwordHash: demoHash,
      role: 'student',
      phone: '01933445566',
      university: 'Daffodil International University',
      department: 'Software Engineering',
      semester: '4th Semester',
      gender: 'Male',
      budget: 5200,
      preferredLocation: 'Mirpur',
      verifiedOwner: false,
      avatar: AVATAR_MALE,
      bio: 'Software engineering student active in competitive programming. Looking for a budget-friendly room near Mirpur 10.',
      preferences: {
        sleepSchedule: 'Night Owl',
        cleanliness: 'Moderate',
        studyHabits: 'Quiet Focus',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Halal / Home-style',
      },
      createdAt: now,
    },
    {
      id: stu6Id,
      name: 'Tasnim Tabassum',
      email: 'tasnim.uiu@uiu.ac.bd',
      passwordHash: demoHash,
      role: 'student',
      phone: '01644556677',
      university: 'United International University',
      department: 'CSE',
      semester: '3rd Year',
      gender: 'Female',
      budget: 7200,
      preferredLocation: 'Uttara',
      verifiedOwner: false,
      avatar: AVATAR_FEMALE,
      bio: 'Calm and punctual CSE student seeking a female roommate in Uttara Sector 7 or Bashundhara.',
      preferences: {
        sleepSchedule: 'Early Bird',
        cleanliness: 'Very Tidy',
        studyHabits: 'Quiet Focus',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Halal / Home-style',
      },
      createdAt: now,
    },
    {
      id: stu7Id,
      name: 'Fahim Chowdhury',
      email: 'fahim.cu@cu.ac.bd',
      passwordHash: demoHash,
      role: 'student',
      phone: '01777665544',
      university: 'University of Chittagong',
      department: 'Economics',
      semester: '6th Semester',
      gender: 'Male',
      budget: 4800,
      preferredLocation: 'Chattogram',
      verifiedOwner: false,
      avatar: AVATAR_MALE,
      bio: 'CU Economics student looking near Nasirabad/GEC Circle. Enjoy group exam prep and keeping expenses transparent.',
      preferences: {
        sleepSchedule: 'Balanced',
        cleanliness: 'Moderate',
        studyHabits: 'Collaborative',
        smokingPreference: 'Outside Only',
        foodPreference: 'Halal / Home-style',
      },
      createdAt: now,
    },
    {
      id: stu8Id,
      name: 'Arifur Rahman',
      email: 'arif.aust@aust.edu',
      passwordHash: demoHash,
      role: 'student',
      phone: '01555443322',
      university: 'AUST',
      department: 'Civil Engineering',
      semester: '5th Semester',
      gender: 'Male',
      budget: 6400,
      preferredLocation: 'Farmgate',
      verifiedOwner: false,
      avatar: AVATAR_MALE,
      bio: 'AUST Civil student looking around Farmgate or Mohammadpur. Early riser, vegetarian-friendly kitchen habits.',
      preferences: {
        sleepSchedule: 'Early Bird',
        cleanliness: 'Very Tidy',
        studyHabits: 'Flexible',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Vegetarian',
      },
      createdAt: now,
    },
  ];

  const hostels: HostelDTO[] = [
    {
      id: newId(),
      ownerId: owner1Id,
      ownerName: 'Karim Uddin',
      ownerPhone: '01811223344',
      ownerEmail: 'karim@nestlink.bd',
      ownerVerified: true,
      name: 'Satmasjid Scholars Residence',
      location: 'Dhanmondi',
      address: 'House 42, Road 9/A, Dhanmondi, Dhaka 1209',
      monthlyRent: 6800,
      roomTypes: ['Shared Twin', 'Single'],
      totalBeds: 36,
      availableBeds: 6,
      genderPreference: 'Male',
      facilities: {
        wifi: true,
        meals: true,
        generator: true,
        attachedBathroom: true,
        ac: false,
        laundry: true,
        cctv: true,
        studyRoom: true,
      },
      photos: [IMG_DHANMONDI, IMG_HERO, IMG_CHATTOGRAM],
      description:
        'A quiet, well-ventilated residence two minutes from Satmasjid Road bus stops. Built specifically for engineering and medical students who value reliable fiber internet, uninterrupted generator backup, and structured study spaces.',
      rules: [
        'Main gate closes at 11:30 PM (late entry with prior caretaker notice)',
        'Quiet hours observed from 10:30 PM to 6:30 AM',
        'No smoking or loud speakers inside rooms',
        'Visitors permitted in the ground-floor lounge until 8:00 PM',
      ],
      mealsInfo: 'Three nutritious home-style Bengali meals daily (optional 3,200 BDT/month or included in twin package).',
      securityInfo: '24/7 biometric access, night guard, and 12 HD CCTV cameras across corridors.',
      nearbyUniversities: ['University of Dhaka', 'BUET', 'Daffodil International University', 'UIU Dhanmondi'],
      verified: true,
      approved: true,
      rating: 4.8,
      reviewCount: 2,
      createdAt: now,
    },
    {
      id: newId(),
      ownerId: owner2Id,
      ownerName: 'Farhana Yasmin',
      ownerPhone: '01911445566',
      ownerEmail: 'farhana.residences@nestlink.bd',
      ownerVerified: true,
      name: 'Bashundhara Crescent Female Hostel',
      location: 'Bashundhara',
      address: 'Plot 18, Block C, Road 4, Bashundhara R/A, Dhaka 1229',
      monthlyRent: 8500,
      roomTypes: ['Single', 'Shared Twin'],
      totalBeds: 44,
      availableBeds: 5,
      genderPreference: 'Female',
      facilities: {
        wifi: true,
        meals: true,
        generator: true,
        attachedBathroom: true,
        ac: true,
        laundry: true,
        cctv: true,
        studyRoom: true,
      },
      photos: [IMG_BASHUNDHARA, IMG_UTTARA, IMG_CHATTOGRAM],
      description:
        'Secure, sunlit female student residence walking distance from NSU and IUB gates. Features dedicated individual study desks, air-conditioned rooms, high-speed dual-ISP fiber, and an on-site female warden.',
      rules: [
        'Female residents only; male guests restricted to ground reception',
        'ID card verification required at main entrance',
        'Cooking inside bedrooms prohibited; common pantry available 24/7',
      ],
      mealsInfo: 'Freshly prepared breakfast, lunch, and dinner served in the hygienic 2nd-floor dining hall.',
      securityInfo: '24/7 female security guard, smart card lobby lock, and CCTV on every floor.',
      nearbyUniversities: ['North South University', 'IUB', 'AIUB'],
      verified: true,
      approved: true,
      rating: 4.9,
      reviewCount: 2,
      createdAt: now,
    },
    {
      id: newId(),
      ownerId: owner1Id,
      ownerName: 'Karim Uddin',
      ownerPhone: '01811223344',
      ownerEmail: 'karim@nestlink.bd',
      ownerVerified: true,
      name: 'Uttara Sector 7 Studio Dorms',
      location: 'Uttara',
      address: 'House 14, Road 12, Sector 7, Uttara, Dhaka 1230',
      monthlyRent: 7400,
      roomTypes: ['Single', 'Shared Twin'],
      totalBeds: 28,
      availableBeds: 4,
      genderPreference: 'Female',
      facilities: {
        wifi: true,
        meals: false,
        generator: true,
        attachedBathroom: true,
        ac: true,
        laundry: true,
        cctv: true,
        studyRoom: true,
      },
      photos: [IMG_UTTARA, IMG_DHANMONDI, IMG_BASHUNDHARA],
      description:
        'Minimalist private and twin-share rooms just 5 minutes from Uttara North Metro Station. Ideal for students commuting via MRT Line 6 or studying in Uttara.',
      rules: [
        'Keep shared kitchen spotless after use',
        'Silent study lounge open 24 hours',
        'One-month refundable security deposit',
      ],
      mealsInfo: 'Self-catering modern kitchenette on every floor with purified drinking water.',
      securityInfo: 'Gated residential sector with round-the-clock guard and CCTV monitoring.',
      nearbyUniversities: ['Uttara University', 'IUBAT', 'BGMEA University'],
      verified: true,
      approved: true,
      rating: 4.7,
      reviewCount: 1,
      createdAt: now,
    },
    {
      id: newId(),
      ownerId: owner1Id,
      ownerName: 'Karim Uddin',
      ownerPhone: '01811223344',
      ownerEmail: 'karim@nestlink.bd',
      ownerVerified: true,
      name: 'Mirpur Metro Hub Student Home',
      location: 'Mirpur',
      address: 'Block B, Avenue 3, Mirpur 10, Dhaka 1216',
      monthlyRent: 4800,
      roomTypes: ['Shared Twin', '3-Bed Room', '4-Bed Dorm'],
      totalBeds: 50,
      availableBeds: 11,
      genderPreference: 'Male',
      facilities: {
        wifi: true,
        meals: true,
        generator: true,
        attachedBathroom: false,
        ac: false,
        laundry: false,
        cctv: true,
        studyRoom: true,
      },
      photos: [IMG_CHATTOGRAM, IMG_DHANMONDI, IMG_HERO],
      description:
        'Affordable, metro-connected student hostel right off Mirpur 10 Circle. High-speed fiber Wi-Fi, backup IPS/generator for online classes, and friendly student community.',
      rules: [
        'Respect roommate sleep schedules after midnight',
        'Monthly rent due by the 5th of each month',
        'No pets or unauthorized electrical heaters',
      ],
      mealsInfo: 'Two-time or three-time mess meal options managed transparently by resident committee.',
      securityInfo: 'Resident caretaker on premises 24/7 with CCTV coverage at entry and stairs.',
      nearbyUniversities: ['BUBT', 'Mirpur University College', 'Daffodil (via Metro)'],
      verified: true,
      approved: true,
      rating: 4.4,
      reviewCount: 1,
      createdAt: now,
    },
    {
      id: newId(),
      ownerId: owner2Id,
      ownerName: 'Farhana Yasmin',
      ownerPhone: '01911445566',
      ownerEmail: 'farhana.residences@nestlink.bd',
      ownerVerified: true,
      name: 'Mohakhali Tech & Design Suites',
      location: 'Mohakhali',
      address: 'House 29, Road 2, Mohakhali DOHS Link, Dhaka 1206',
      monthlyRent: 9200,
      roomTypes: ['Single', 'Shared Twin'],
      totalBeds: 30,
      availableBeds: 3,
      genderPreference: 'Female',
      facilities: {
        wifi: true,
        meals: true,
        generator: true,
        attachedBathroom: true,
        ac: true,
        laundry: true,
        cctv: true,
        studyRoom: true,
      },
      photos: [IMG_HERO, IMG_UTTARA, IMG_BASHUNDHARA],
      description:
        'Bright studio-style hostel tailored for BRACU and AUST students. Wide drafting/study tables, 100 Mbps redundant Wi-Fi, and calm terrace reading corner.',
      rules: [
        'Quiet floor policy for thesis & studio students',
        'Guests only in reception lounge',
        'Bi-weekly deep cleaning included',
      ],
      mealsInfo: 'Balanced lunch and dinner menu with vegetarian option upon request.',
      securityInfo: 'Intercom, smart access control, and 24/7 female supervisor.',
      nearbyUniversities: ['BRAC University', 'AUST', 'Primeasia University'],
      verified: true,
      approved: true,
      rating: 4.8,
      reviewCount: 1,
      createdAt: now,
    },
    {
      id: newId(),
      ownerId: owner1Id,
      ownerName: 'Karim Uddin',
      ownerPhone: '01811223344',
      ownerEmail: 'karim@nestlink.bd',
      ownerVerified: true,
      name: 'Farmgate Green Campus Hostel',
      location: 'Farmgate',
      address: '68 Indira Road, Farmgate, Dhaka 1215',
      monthlyRent: 5600,
      roomTypes: ['Shared Twin', '3-Bed Room'],
      totalBeds: 40,
      availableBeds: 8,
      genderPreference: 'Male',
      facilities: {
        wifi: true,
        meals: true,
        generator: false,
        attachedBathroom: false,
        ac: false,
        laundry: true,
        cctv: true,
        studyRoom: true,
      },
      photos: [IMG_DHANMONDI, IMG_CHATTOGRAM],
      description:
        'Central Dhaka location near Farmgate Metro and coaching hubs. Easy commute to DU, BUET, AUST, and Sher-e-Bangla Agricultural University.',
      rules: [
        'No smoking indoors',
        'Main gate lock at 11:30 PM',
        'Keep corridors clear of shoes and bicycles',
      ],
      mealsInfo: 'Standard 3-meal hostel dining plan with weekly special biriyani on Fridays.',
      securityInfo: 'Full-time night guard and corridor CCTV.',
      nearbyUniversities: ['University of Dhaka', 'AUST', 'University of Asia Pacific', 'SAU'],
      verified: true,
      approved: true,
      rating: 4.3,
      reviewCount: 0,
      createdAt: now,
    },
    {
      id: newId(),
      ownerId: owner2Id,
      ownerName: 'Farhana Yasmin',
      ownerPhone: '01911445566',
      ownerEmail: 'farhana.residences@nestlink.bd',
      ownerVerified: true,
      name: 'Mohammadpur Iqbal Road Residence',
      location: 'Mohammadpur',
      address: 'House 11, Iqbal Road, Mohammadpur, Dhaka 1207',
      monthlyRent: 6200,
      roomTypes: ['Shared Twin', '3-Bed Room', 'Single'],
      totalBeds: 32,
      availableBeds: 7,
      genderPreference: 'Co-ed',
      facilities: {
        wifi: true,
        meals: true,
        generator: true,
        attachedBathroom: true,
        ac: false,
        laundry: true,
        cctv: true,
        studyRoom: false,
      },
      photos: [IMG_BASHUNDHARA, IMG_DHANMONDI],
      description:
        'Separate male and female wings in a leafy Iqbal Road building close to Asad Gate and Dhanmondi 27. Spacious balconies and sunlit study desks.',
      rules: [
        'Separate floor access strictly enforced between male and female wings',
        'No loud music after 10:00 PM',
      ],
      mealsInfo: 'Home-cooked tiffin & dinner service available with clean filtered water.',
      securityInfo: '24/7 caretaker and CCTV on all entry points.',
      nearbyUniversities: ['ULAB', 'Stamford University', 'University of Dhaka'],
      verified: true,
      approved: true,
      rating: 4.5,
      reviewCount: 0,
      createdAt: now,
    },
    {
      id: newId(),
      ownerId: owner3Id,
      ownerName: 'Mahmudul Hasan',
      ownerPhone: '01611778899',
      ownerEmail: 'mahmud.chattogram@nestlink.bd',
      ownerVerified: true,
      name: 'Nasirabad Hillview Student Lodge',
      location: 'Chattogram',
      address: 'Road 3, Nasirabad Housing Society, Chattogram 4000',
      monthlyRent: 4500,
      roomTypes: ['Shared Twin', '4-Bed Dorm'],
      totalBeds: 48,
      availableBeds: 9,
      genderPreference: 'Male',
      facilities: {
        wifi: true,
        meals: true,
        generator: true,
        attachedBathroom: true,
        ac: false,
        laundry: true,
        cctv: true,
        studyRoom: true,
      },
      photos: [IMG_CHATTOGRAM, IMG_HERO, IMG_DHANMONDI],
      description:
        'Clean, breezy student lodge in Nasirabad Housing Society with quick shuttle access to University of Chittagong and CUET buses at GEC Circle.',
      rules: [
        'Maintain cleanliness in shared bathrooms and dining hall',
        'Quiet study environment during semester finals',
      ],
      mealsInfo: 'Chattogram-style fresh fish, chicken, and vegetable daily mess plan.',
      securityInfo: 'Housing society gated security plus in-house caretaker.',
      nearbyUniversities: ['University of Chittagong', 'CUET', 'IIUC', 'East Delta University'],
      verified: true,
      approved: true,
      rating: 4.6,
      reviewCount: 1,
      createdAt: now,
    },
  ];

  // Build RoommateProfile records for all student users
  const roommates: RoommateProfileDTO[] = users
    .filter((u) => u.role === 'student')
    .map((u) => ({
      id: newId(),
      userId: u.id,
      name: u.name,
      avatar: u.avatar,
      university: u.university,
      department: u.department,
      semester: u.semester,
      gender: u.gender,
      budget: u.budget,
      preferredLocation: u.preferredLocation,
      sleepSchedule: u.preferences.sleepSchedule,
      cleanliness: u.preferences.cleanliness,
      studyHabits: u.preferences.studyHabits,
      smokingPreference: u.preferences.smokingPreference,
      foodPreference: u.preferences.foodPreference,
      bio: u.bio,
      active: true,
      createdAt: now,
    }));

  const reviews: ReviewDTO[] = [
    {
      id: newId(),
      hostelId: hostels[0].id,
      userId: stu3Id,
      userName: 'Tanvir Ahmed',
      userUniversity: 'BUET',
      rating: 5,
      comment:
        'Wi-Fi stays rock solid even during evening lab submissions, and the study room on the 3rd floor is genuinely quiet.',
      createdAt: now,
    },
    {
      id: newId(),
      hostelId: hostels[0].id,
      userId: studentDemoId,
      userName: 'Rafiul Islam',
      userUniversity: 'University of Dhaka',
      rating: 5,
      comment: 'Super close to Satmasjid bus stops and the caretaker responds quickly whenever maintenance is needed.',
      createdAt: now,
    },
    {
      id: newId(),
      hostelId: hostels[1].id,
      userId: stu2Id,
      userName: 'Nusrat Jahan Mim',
      userUniversity: 'North South University',
      rating: 5,
      comment: 'Only a 7-minute walk to NSU gate. Meals are clean and the female warden is very supportive.',
      createdAt: now,
    },
    {
      id: newId(),
      hostelId: hostels[7].id,
      userId: stu7Id,
      userName: 'Fahim Chowdhury',
      userUniversity: 'University of Chittagong',
      rating: 5,
      comment: 'Best value near GEC Circle with proper generator backup and clean dining.',
      createdAt: now,
    },
  ];

  const bookings: BookingRequestDTO[] = [
    {
      id: newId(),
      studentId: studentDemoId,
      studentName: 'Rafiul Islam',
      studentEmail: 'rafi@du.ac.bd',
      studentPhone: '01712345678',
      studentUniversity: 'University of Dhaka',
      hostelId: hostels[0].id,
      hostelName: hostels[0].name,
      hostelLocation: hostels[0].location,
      monthlyRent: hostels[0].monthlyRent,
      ownerId: owner1Id,
      roomType: 'Shared Twin',
      moveInDate: '2026-12-01',
      message: 'Looking for a quiet twin-share bed from December 1st for my spring semester.',
      status: 'Pending',
      ownerNote: '',
      createdAt: now,
    },
    {
      id: newId(),
      studentId: stu3Id,
      studentName: 'Tanvir Ahmed',
      studentEmail: 'tanvir.buet@buet.ac.bd',
      studentPhone: '01799887766',
      studentUniversity: 'BUET',
      hostelId: hostels[5].id,
      hostelName: hostels[5].name,
      hostelLocation: hostels[5].location,
      monthlyRent: hostels[5].monthlyRent,
      ownerId: owner1Id,
      roomType: 'Shared Twin',
      moveInDate: '2026-12-05',
      message: 'Need a bed near Farmgate for thesis semester.',
      status: 'Accepted',
      ownerNote: 'Room 204 reserved for you. Please bring your student ID during check-in.',
      createdAt: now,
    },
  ];

  const favorites: FavoriteDTO[] = [
    {
      id: newId(),
      userId: studentDemoId,
      itemType: 'hostel',
      itemId: hostels[0].id,
      createdAt: now,
    },
  ];

  const messages: MessageDTO[] = [
    {
      id: newId(),
      senderId: owner1Id,
      senderName: 'Karim Uddin',
      senderEmail: 'karim@nestlink.bd',
      recipientId: studentDemoId,
      recipientName: 'Rafiul Islam',
      hostelId: hostels[0].id,
      hostelName: hostels[0].name,
      subject: 'Welcome to Satmasjid Scholars Residence',
      body: 'Hi Rafiul, thank you for your booking inquiry. You are welcome to visit Room 302 any day between 10 AM and 6 PM.',
      read: false,
      createdAt: now,
    },
  ];

  return { users, hostels, roommates, bookings, favorites, reviews, messages };
}

function toUserDTO(u: any): UserDTO {
  return {
    id: String(u._id || u.id),
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || '',
    university: u.university || '',
    department: u.department || '',
    semester: u.semester || '3rd Year',
    gender: u.gender || 'Male',
    budget: Number(u.budget || 6500),
    preferredLocation: u.preferredLocation || 'Dhanmondi',
    verifiedOwner: Boolean(u.verifiedOwner),
    avatar: u.avatar || '',
    bio: u.bio || '',
    preferences: {
      sleepSchedule: u.preferences?.sleepSchedule || 'Balanced',
      cleanliness: u.preferences?.cleanliness || 'Moderate',
      studyHabits: u.preferences?.studyHabits || 'Quiet Focus',
      smokingPreference: u.preferences?.smokingPreference || 'Non-Smoker',
      foodPreference: u.preferences?.foodPreference || 'Halal / Home-style',
    },
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function initDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI?.trim();
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      useMongo = true;
      console.log('[NestLink DB] Connected to MongoDB via Mongoose.');
      const count = await UserModel.countDocuments();
      if (count === 0) {
        const seed = buildSeedData();
        // Seed into MongoDB preserving string IDs mapped to ObjectIds
        const userMap = new Map<string, any>();
        for (const u of seed.users) {
          const doc = await UserModel.create({
            _id: new mongoose.Types.ObjectId(u.id),
            ...u,
          });
          userMap.set(u.id, doc);
        }
        for (const h of seed.hostels) {
          await HostelModel.create({
            _id: new mongoose.Types.ObjectId(h.id),
            ...h,
            ownerId: new mongoose.Types.ObjectId(h.ownerId),
          });
        }
        for (const r of seed.roommates) {
          await RoommateProfileModel.create({
            _id: new mongoose.Types.ObjectId(r.id),
            ...r,
            userId: new mongoose.Types.ObjectId(r.userId),
          });
        }
        for (const rev of seed.reviews) {
          await ReviewModel.create({
            _id: new mongoose.Types.ObjectId(rev.id),
            ...rev,
            hostelId: new mongoose.Types.ObjectId(rev.hostelId),
            userId: new mongoose.Types.ObjectId(rev.userId),
          });
        }
        for (const b of seed.bookings) {
          await BookingRequestModel.create({
            _id: new mongoose.Types.ObjectId(b.id),
            ...b,
            studentId: new mongoose.Types.ObjectId(b.studentId),
            hostelId: new mongoose.Types.ObjectId(b.hostelId),
            ownerId: new mongoose.Types.ObjectId(b.ownerId),
          });
        }
        for (const f of seed.favorites) {
          await FavoriteModel.create({
            _id: new mongoose.Types.ObjectId(f.id),
            ...f,
            userId: new mongoose.Types.ObjectId(f.userId),
          });
        }
        for (const m of seed.messages) {
          await MessageModel.create({
            _id: new mongoose.Types.ObjectId(m.id),
            ...m,
            senderId: new mongoose.Types.ObjectId(m.senderId),
            recipientId: new mongoose.Types.ObjectId(m.recipientId),
          });
        }
        console.log('[NestLink DB] Seeded initial MongoDB collections.');
      }
      return;
    } catch (err) {
      console.warn('[NestLink DB] MongoDB connection failed, falling back to persistent local store:', (err as Error).message);
      useMongo = false;
    }
  }

  // Local persistent JSON store
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      localData = JSON.parse(raw) as LocalDatabase;
      if (!localData.users || localData.users.length === 0) {
        localData = buildSeedData();
        saveLocalData();
      }
      console.log('[NestLink DB] Loaded persistent local store (data/nestlink-db.json).');
      return;
    } catch {
      // Corrupt file fallback
    }
  }
  localData = buildSeedData();
  saveLocalData();
  console.log('[NestLink DB] Initialized persistent local store with seed data.');
}

// Unified Data Repository (works identically over Mongoose or Local Store)
export const db = {
  isMongoActive: () => useMongo,

  users: {
    async findByEmail(email: string): Promise<StoredUser | null> {
      const normalized = email.trim().toLowerCase();
      if (useMongo) {
        const doc = await UserModel.findOne({ email: normalized }).lean();
        if (!doc) return null;
        return { ...toUserDTO(doc), passwordHash: doc.passwordHash, isDemo: doc.isDemo };
      }
      return localData.users.find((u) => u.email.toLowerCase() === normalized) || null;
    },

    async findById(id: string): Promise<StoredUser | null> {
      if (useMongo) {
        if (!mongoose.isValidObjectId(id)) return null;
        const doc = await UserModel.findById(id).lean();
        if (!doc) return null;
        return { ...toUserDTO(doc), passwordHash: doc.passwordHash, isDemo: doc.isDemo };
      }
      return localData.users.find((u) => u.id === id) || null;
    },

    async findDemoByRole(role: 'student' | 'owner'): Promise<StoredUser | null> {
      if (useMongo) {
        const doc = await UserModel.findOne({ role, isDemo: true }).lean();
        if (!doc) return null;
        return { ...toUserDTO(doc), passwordHash: doc.passwordHash, isDemo: doc.isDemo };
      }
      return localData.users.find((u) => u.role === role && u.isDemo) || null;
    },

    async findAdmin(): Promise<StoredUser | null> {
      if (useMongo) {
        const doc = await UserModel.findOne({ role: 'admin' }).lean();
        if (!doc) return null;
        return { ...toUserDTO(doc), passwordHash: doc.passwordHash };
      }
      return localData.users.find((u) => u.role === 'admin') || null;
    },

    async listAll(): Promise<UserDTO[]> {
      if (useMongo) {
        const docs = await UserModel.find().sort({ createdAt: -1 }).lean();
        return docs.map(toUserDTO);
      }
      return localData.users.map((u) => toUserDTO(u));
    },

    async create(input: Omit<StoredUser, 'id' | 'createdAt'>): Promise<UserDTO> {
      const id = newId();
      const createdAt = new Date().toISOString();
      if (useMongo) {
        const doc = await UserModel.create({
          _id: new mongoose.Types.ObjectId(id),
          ...input,
        });
        return toUserDTO(doc.toObject());
      }
      const user: StoredUser = { ...input, id, createdAt };
      localData.users.unshift(user);
      saveLocalData();
      return toUserDTO(user);
    },

    async update(id: string, patch: Partial<StoredUser>): Promise<UserDTO | null> {
      if (useMongo) {
        if (!mongoose.isValidObjectId(id)) return null;
        const doc = await UserModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
        return doc ? toUserDTO(doc) : null;
      }
      const idx = localData.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      localData.users[idx] = { ...localData.users[idx], ...patch };
      // Keep ownerName/verified synced on hostels
      if (typeof patch.verifiedOwner === 'boolean' || patch.name) {
        const updated = localData.users[idx];
        localData.hostels = localData.hostels.map((h) =>
          h.ownerId === id
            ? { ...h, ownerName: updated.name, ownerVerified: updated.verifiedOwner }
            : h
        );
      }
      saveLocalData();
      return toUserDTO(localData.users[idx]);
    },
  },

  hostels: {
    async list(includeUnapproved = false): Promise<HostelDTO[]> {
      if (useMongo) {
        const query = includeUnapproved ? {} : { approved: true };
        const docs = await HostelModel.find(query).sort({ createdAt: -1 }).lean();
        const ownerIds = [...new Set(docs.map((d) => String(d.ownerId)))];
        const owners = await UserModel.find({ _id: { $in: ownerIds } }).lean();
        const ownerMap = new Map(owners.map((o) => [String(o._id), o]));
        return docs.map((d: any) => {
          const owner = ownerMap.get(String(d.ownerId));
          return {
            id: String(d._id),
            ownerId: String(d.ownerId),
            ownerName: owner?.name || 'Hostel Owner',
            ownerPhone: owner?.phone || '',
            ownerEmail: owner?.email || '',
            ownerVerified: Boolean(owner?.verifiedOwner),
            name: d.name,
            location: d.location,
            address: d.address,
            monthlyRent: d.monthlyRent,
            roomTypes: d.roomTypes,
            totalBeds: d.totalBeds,
            availableBeds: d.availableBeds,
            genderPreference: d.genderPreference,
            facilities: d.facilities,
            photos: d.photos,
            description: d.description,
            rules: d.rules,
            mealsInfo: d.mealsInfo,
            securityInfo: d.securityInfo,
            nearbyUniversities: d.nearbyUniversities,
            verified: d.verified,
            approved: d.approved,
            rating: d.rating,
            reviewCount: d.reviewCount,
            createdAt: new Date(d.createdAt).toISOString(),
          };
        });
      }
      return localData.hostels.filter((h) => includeUnapproved || h.approved);
    },

    async findById(id: string): Promise<HostelDTO | null> {
      if (useMongo) {
        if (!mongoose.isValidObjectId(id)) return null;
        const all = await this.list(true);
        return all.find((h) => h.id === id) || null;
      }
      return localData.hostels.find((h) => h.id === id) || null;
    },

    async create(input: Omit<HostelDTO, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Promise<HostelDTO> {
      const id = newId();
      const createdAt = new Date().toISOString();
      if (useMongo) {
        await HostelModel.create({
          _id: new mongoose.Types.ObjectId(id),
          ...input,
          ownerId: new mongoose.Types.ObjectId(input.ownerId),
          rating: 4.5,
          reviewCount: 0,
        });
        return (await this.findById(id))!;
      }
      const hostel: HostelDTO = {
        ...input,
        id,
        rating: 4.5,
        reviewCount: 0,
        createdAt,
      };
      localData.hostels.unshift(hostel);
      saveLocalData();
      return hostel;
    },

    async update(id: string, patch: Partial<HostelDTO>): Promise<HostelDTO | null> {
      if (useMongo) {
        if (!mongoose.isValidObjectId(id)) return null;
        await HostelModel.findByIdAndUpdate(id, { $set: patch }, { new: true });
        return this.findById(id);
      }
      const idx = localData.hostels.findIndex((h) => h.id === id);
      if (idx === -1) return null;
      localData.hostels[idx] = { ...localData.hostels[idx], ...patch };
      saveLocalData();
      return localData.hostels[idx];
    },

    async remove(id: string): Promise<boolean> {
      if (useMongo) {
        if (!mongoose.isValidObjectId(id)) return false;
        const res = await HostelModel.findByIdAndDelete(id);
        await ReviewModel.deleteMany({ hostelId: id });
        await BookingRequestModel.deleteMany({ hostelId: id });
        return Boolean(res);
      }
      const before = localData.hostels.length;
      localData.hostels = localData.hostels.filter((h) => h.id !== id);
      localData.reviews = localData.reviews.filter((r) => r.hostelId !== id);
      localData.bookings = localData.bookings.filter((b) => b.hostelId !== id);
      localData.favorites = localData.favorites.filter((f) => !(f.itemType === 'hostel' && f.itemId === id));
      saveLocalData();
      return localData.hostels.length < before;
    },
  },

  roommates: {
    async list(): Promise<RoommateProfileDTO[]> {
      if (useMongo) {
        const docs = await RoommateProfileModel.find({ active: true }).sort({ createdAt: -1 }).lean();
        return docs.map((d: any) => ({
          id: String(d._id),
          userId: String(d.userId),
          name: d.name,
          avatar: d.avatar,
          university: d.university,
          department: d.department,
          semester: d.semester,
          gender: d.gender,
          budget: d.budget,
          preferredLocation: d.preferredLocation,
          sleepSchedule: d.sleepSchedule,
          cleanliness: d.cleanliness,
          studyHabits: d.studyHabits,
          smokingPreference: d.smokingPreference,
          foodPreference: d.foodPreference,
          bio: d.bio,
          active: d.active,
          createdAt: new Date(d.createdAt).toISOString(),
        }));
      }
      return localData.roommates.filter((r) => r.active);
    },

    async upsertForUser(user: UserDTO): Promise<RoommateProfileDTO | null> {
      if (user.role !== 'student') return null;
      const payload = {
        userId: user.id,
        name: user.name,
        avatar: user.avatar || (user.gender === 'Female' ? AVATAR_FEMALE : AVATAR_MALE),
        university: user.university || 'University of Dhaka',
        department: user.department || 'Computer Science',
        semester: user.semester || '3rd Year',
        gender: user.gender,
        budget: user.budget,
        preferredLocation: user.preferredLocation,
        sleepSchedule: user.preferences.sleepSchedule,
        cleanliness: user.preferences.cleanliness,
        studyHabits: user.preferences.studyHabits,
        smokingPreference: user.preferences.smokingPreference,
        foodPreference: user.preferences.foodPreference,
        bio: user.bio || `${user.department} student at ${user.university} looking for a compatible roommate.`,
        active: true,
      };

      if (useMongo) {
        const doc = await RoommateProfileModel.findOneAndUpdate(
          { userId: new mongoose.Types.ObjectId(user.id) },
          { $set: payload },
          { upsert: true, new: true }
        ).lean();
        return {
          ...(payload as any),
          id: String((doc as any)._id),
          createdAt: new Date((doc as any).createdAt).toISOString(),
        };
      }

      const idx = localData.roommates.findIndex((r) => r.userId === user.id);
      if (idx >= 0) {
        localData.roommates[idx] = { ...localData.roommates[idx], ...payload };
        saveLocalData();
        return localData.roommates[idx];
      }
      const created: RoommateProfileDTO = {
        ...payload,
        id: newId(),
        createdAt: new Date().toISOString(),
      };
      localData.roommates.unshift(created);
      saveLocalData();
      return created;
    },
  },

  bookings: {
    async listByStudent(studentId: string): Promise<BookingRequestDTO[]> {
      if (useMongo) {
        const docs = await BookingRequestModel.find({ studentId }).sort({ createdAt: -1 }).lean();
        return this.hydrateMongo(docs);
      }
      return localData.bookings.filter((b) => b.studentId === studentId);
    },

    async listByOwner(ownerId: string): Promise<BookingRequestDTO[]> {
      if (useMongo) {
        const docs = await BookingRequestModel.find({ ownerId }).sort({ createdAt: -1 }).lean();
        return this.hydrateMongo(docs);
      }
      return localData.bookings.filter((b) => b.ownerId === ownerId);
    },

    async listAll(): Promise<BookingRequestDTO[]> {
      if (useMongo) {
        const docs = await BookingRequestModel.find().sort({ createdAt: -1 }).lean();
        return this.hydrateMongo(docs);
      }
      return localData.bookings;
    },

    async hydrateMongo(docs: any[]): Promise<BookingRequestDTO[]> {
      const results: BookingRequestDTO[] = [];
      for (const d of docs) {
        const student = await db.users.findById(String(d.studentId));
        const hostel = await db.hostels.findById(String(d.hostelId));
        results.push({
          id: String(d._id),
          studentId: String(d.studentId),
          studentName: student?.name || 'Student',
          studentEmail: student?.email || '',
          studentPhone: student?.phone || '',
          studentUniversity: student?.university || '',
          hostelId: String(d.hostelId),
          hostelName: hostel?.name || 'Hostel',
          hostelLocation: hostel?.location || '',
          monthlyRent: hostel?.monthlyRent || 0,
          ownerId: String(d.ownerId),
          roomType: d.roomType,
          moveInDate: d.moveInDate,
          message: d.message,
          status: d.status,
          ownerNote: d.ownerNote || '',
          createdAt: new Date(d.createdAt).toISOString(),
        });
      }
      return results;
    },

    async findById(id: string): Promise<BookingRequestDTO | null> {
      if (useMongo) {
        if (!mongoose.isValidObjectId(id)) return null;
        const doc = await BookingRequestModel.findById(id).lean();
        if (!doc) return null;
        const list = await this.hydrateMongo([doc]);
        return list[0] || null;
      }
      return localData.bookings.find((b) => b.id === id) || null;
    },

    async create(input: Omit<BookingRequestDTO, 'id' | 'createdAt' | 'status' | 'ownerNote'>): Promise<BookingRequestDTO> {
      const id = newId();
      const createdAt = new Date().toISOString();
      if (useMongo) {
        await BookingRequestModel.create({
          _id: new mongoose.Types.ObjectId(id),
          studentId: new mongoose.Types.ObjectId(input.studentId),
          hostelId: new mongoose.Types.ObjectId(input.hostelId),
          ownerId: new mongoose.Types.ObjectId(input.ownerId),
          roomType: input.roomType,
          moveInDate: input.moveInDate,
          message: input.message,
          status: 'Pending',
          ownerNote: '',
        });
        return (await this.findById(id))!;
      }
      const booking: BookingRequestDTO = {
        ...input,
        id,
        status: 'Pending',
        ownerNote: '',
        createdAt,
      };
      localData.bookings.unshift(booking);
      saveLocalData();
      return booking;
    },

    async updateStatus(id: string, status: BookingStatus, ownerNote: string): Promise<BookingRequestDTO | null> {
      if (useMongo) {
        if (!mongoose.isValidObjectId(id)) return null;
        await BookingRequestModel.findByIdAndUpdate(id, { $set: { status, ownerNote } });
        return this.findById(id);
      }
      const idx = localData.bookings.findIndex((b) => b.id === id);
      if (idx === -1) return null;
      localData.bookings[idx] = { ...localData.bookings[idx], status, ownerNote };
      saveLocalData();
      return localData.bookings[idx];
    },
  },

  favorites: {
    async listByUser(userId: string): Promise<FavoriteDTO[]> {
      if (useMongo) {
        const docs = await FavoriteModel.find({ userId }).sort({ createdAt: -1 }).lean();
        return docs.map((d: any) => ({
          id: String(d._id),
          userId: String(d.userId),
          itemType: d.itemType,
          itemId: d.itemId,
          createdAt: new Date(d.createdAt).toISOString(),
        }));
      }
      return localData.favorites.filter((f) => f.userId === userId);
    },

    async toggle(userId: string, itemType: 'hostel' | 'roommate', itemId: string): Promise<{ saved: boolean }> {
      if (useMongo) {
        const existing = await FavoriteModel.findOne({ userId, itemType, itemId });
        if (existing) {
          await FavoriteModel.deleteOne({ _id: existing._id });
          return { saved: false };
        }
        await FavoriteModel.create({ userId, itemType, itemId });
        return { saved: true };
      }
      const idx = localData.favorites.findIndex(
        (f) => f.userId === userId && f.itemType === itemType && f.itemId === itemId
      );
      if (idx >= 0) {
        localData.favorites.splice(idx, 1);
        saveLocalData();
        return { saved: false };
      }
      localData.favorites.unshift({
        id: newId(),
        userId,
        itemType,
        itemId,
        createdAt: new Date().toISOString(),
      });
      saveLocalData();
      return { saved: true };
    },
  },

  reviews: {
    async listByHostel(hostelId: string): Promise<ReviewDTO[]> {
      if (useMongo) {
        const docs = await ReviewModel.find({ hostelId }).sort({ createdAt: -1 }).lean();
        return docs.map((d: any) => ({
          id: String(d._id),
          hostelId: String(d.hostelId),
          userId: String(d.userId),
          userName: d.userName,
          userUniversity: d.userUniversity || '',
          rating: d.rating,
          comment: d.comment,
          createdAt: new Date(d.createdAt).toISOString(),
        }));
      }
      return localData.reviews.filter((r) => r.hostelId === hostelId);
    },

    async create(input: Omit<ReviewDTO, 'id' | 'createdAt'>): Promise<ReviewDTO> {
      const id = newId();
      const createdAt = new Date().toISOString();
      if (useMongo) {
        const doc = await ReviewModel.create({
          _id: new mongoose.Types.ObjectId(id),
          ...input,
          hostelId: new mongoose.Types.ObjectId(input.hostelId),
          userId: new mongoose.Types.ObjectId(input.userId),
        });
        const all = await ReviewModel.find({ hostelId: input.hostelId }).lean();
        const avg = all.reduce((s, r) => s + r.rating, 0) / Math.max(1, all.length);
        await HostelModel.findByIdAndUpdate(input.hostelId, {
          $set: { rating: Number(avg.toFixed(1)), reviewCount: all.length },
        });
        return {
          ...input,
          id: String(doc._id),
          createdAt,
        };
      }
      const review: ReviewDTO = { ...input, id, createdAt };
      localData.reviews.unshift(review);
      const hostelReviews = localData.reviews.filter((r) => r.hostelId === input.hostelId);
      const avg = hostelReviews.reduce((s, r) => s + r.rating, 0) / hostelReviews.length;
      const hIdx = localData.hostels.findIndex((h) => h.id === input.hostelId);
      if (hIdx >= 0) {
        localData.hostels[hIdx].rating = Number(avg.toFixed(1));
        localData.hostels[hIdx].reviewCount = hostelReviews.length;
      }
      saveLocalData();
      return review;
    },
  },

  messages: {
    async listForUser(userId: string): Promise<MessageDTO[]> {
      if (useMongo) {
        const docs = await MessageModel.find({
          $or: [{ recipientId: userId }, { senderId: userId }],
        })
          .sort({ createdAt: -1 })
          .lean();
        return docs.map((d: any) => ({
          id: String(d._id),
          senderId: String(d.senderId),
          senderName: d.senderName,
          senderEmail: d.senderEmail,
          recipientId: String(d.recipientId),
          recipientName: d.recipientName,
          hostelId: d.hostelId,
          hostelName: d.hostelName,
          subject: d.subject,
          body: d.body,
          read: d.read,
          createdAt: new Date(d.createdAt).toISOString(),
        }));
      }
      return localData.messages.filter(
        (m) => m.recipientId === userId || m.senderId === userId
      );
    },

    async create(input: Omit<MessageDTO, 'id' | 'createdAt' | 'read'>): Promise<MessageDTO> {
      const id = newId();
      const createdAt = new Date().toISOString();
      if (useMongo) {
        await MessageModel.create({
          _id: new mongoose.Types.ObjectId(id),
          ...input,
          senderId: new mongoose.Types.ObjectId(input.senderId),
          recipientId: new mongoose.Types.ObjectId(input.recipientId),
          read: false,
        });
        return { ...input, id, read: false, createdAt };
      }
      const msg: MessageDTO = { ...input, id, read: false, createdAt };
      localData.messages.unshift(msg);
      saveLocalData();
      return msg;
    },

    async markRead(id: string, userId: string): Promise<boolean> {
      if (useMongo) {
        if (!mongoose.isValidObjectId(id)) return false;
        const res = await MessageModel.findOneAndUpdate(
          { _id: id, recipientId: userId },
          { $set: { read: true } }
        );
        return Boolean(res);
      }
      const msg = localData.messages.find((m) => m.id === id && m.recipientId === userId);
      if (!msg) return false;
      msg.read = true;
      saveLocalData();
      return true;
    },
  },

  async getAdminStats(): Promise<AdminStatsDTO> {
    const users = await this.users.listAll();
    const hostels = await this.hostels.list(true);
    const bookings = await this.bookings.listAll();
    return {
      totalStudents: users.filter((u) => u.role === 'student').length,
      totalOwners: users.filter((u) => u.role === 'owner').length,
      totalHostels: hostels.length,
      pendingRequests: bookings.filter((b) => b.status === 'Pending').length,
      pendingHostelApprovals: hostels.filter((h) => !h.approved).length,
      verifiedOwners: users.filter((u) => u.role === 'owner' && u.verifiedOwner).length,
    };
  },
};

export function sanitizeUser(u: StoredUser): UserDTO {
  const { passwordHash: _ph, isDemo: _d, ...rest } = u;
  return rest;
}

export function getDefaultAvatar(gender: string): string {
  return gender === 'Female' ? AVATAR_FEMALE : AVATAR_MALE;
}

export const PRESET_HOSTEL_PHOTOS = [
  IMG_DHANMONDI,
  IMG_BASHUNDHARA,
  IMG_UTTARA,
  IMG_CHATTOGRAM,
  IMG_HERO,
];
