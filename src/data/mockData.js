// ============================================================
// EDUMARKET — MOCK DATA
// ============================================================

export const EDUCATION_LEVELS = [
  'Std 1', 'Std 2', 'Std 3', 'Std 4', 'Std 5',
  'Std 6', 'Std 7', 'Std 8', 'Std 9', 'Std 10',
  'Std 11 - Science', 'Std 11 - Commerce', 'Std 11 - Arts',
  'Std 12 - Science', 'Std 12 - Commerce', 'Std 12 - Arts',
  "Bachelor's Degree", "Master's Degree", 'PhD',
  'Government Exam - UPSC', 'Government Exam - SSC',
  'Government Exam - Banking', 'Government Exam - Railway',
  'Government Exam - Other',
];

export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'History', 'Geography',
  'Political Science', 'Economics', 'Computer Science',
  'Accountancy', 'Business Studies', 'Environmental Science',
  'General Knowledge', 'Reasoning & Aptitude',
  'Current Affairs', 'Sociology', 'Psychology', 'Law',
];

export const MOCK_USERS = [
  {
    id: 'user_1',
    fullName: 'Ananya Sharma',
    username: 'ananya_notes',
    email: 'ananya@example.com',
    educationLevel: "Master's Degree",
    avatar: null,
    bio: 'MSc Physics | Passionate about making science accessible through handwritten notes. 4+ years of teaching experience.',
    notesUploaded: 24,
    totalDownloads: 3420,
    rating: 4.9,
    joinedDate: '2024-08-15',
    isOnline: true,
  },
  {
    id: 'user_2',
    fullName: 'Rahul Verma',
    username: 'rahul_edu',
    email: 'rahul@example.com',
    educationLevel: "Bachelor's Degree",
    avatar: null,
    bio: 'B.Tech CSE | I create detailed notes for competitive exams and college subjects.',
    notesUploaded: 18,
    totalDownloads: 2100,
    rating: 4.7,
    joinedDate: '2024-11-02',
    isOnline: false,
  },
  {
    id: 'user_3',
    fullName: 'Priya Patel',
    username: 'priya_studies',
    email: 'priya@example.com',
    educationLevel: 'Std 12 - Science',
    avatar: null,
    bio: 'NEET aspirant | Sharing my Biology & Chemistry notes that helped me score 680+.',
    notesUploaded: 12,
    totalDownloads: 5680,
    rating: 4.8,
    joinedDate: '2025-01-20',
    isOnline: true,
  },
  {
    id: 'user_4',
    fullName: 'Amit Kumar Singh',
    username: 'amit_upsc',
    email: 'amit@example.com',
    educationLevel: 'Government Exam - UPSC',
    avatar: null,
    bio: 'UPSC Mains qualified | Extensive notes on Indian Polity, History, and Geography.',
    notesUploaded: 32,
    totalDownloads: 8900,
    rating: 4.9,
    joinedDate: '2024-06-10',
    isOnline: false,
  },
  {
    id: 'user_5',
    fullName: 'Sneha Reddy',
    username: 'sneha_maths',
    email: 'sneha@example.com',
    educationLevel: 'Std 10',
    avatar: null,
    bio: 'Board topper | My math notes cover every chapter with solved examples. Sharing is caring!',
    notesUploaded: 8,
    totalDownloads: 1450,
    rating: 4.6,
    joinedDate: '2025-03-05',
    isOnline: true,
  },
];

export const MOCK_NOTES = [
  {
    id: 'note_1',
    title: 'Complete Physics Mechanics — Handwritten Notes',
    subject: 'Physics',
    educationLevel: 'Std 12 - Science',
    description: 'Comprehensive handwritten notes covering all chapters of Mechanics for Class 12 Physics. Includes diagrams, derivations, and solved numericals.',
    sellerId: 'user_1',
    price: 149,
    rating: 4.9,
    reviews: 342,
    downloads: 1230,
    pages: 86,
    isHandwritten: true,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    createdAt: '2025-12-10',
    tags: ['mechanics', 'physics', 'class 12', 'JEE', 'NEET'],
  },
  {
    id: 'note_2',
    title: 'Organic Chemistry Complete Guide',
    subject: 'Chemistry',
    educationLevel: 'Std 12 - Science',
    description: 'All named reactions, mechanisms, and important conversions for Organic Chemistry. Color-coded for quick revision.',
    sellerId: 'user_3',
    price: 199,
    rating: 4.8,
    reviews: 518,
    downloads: 2340,
    pages: 124,
    isHandwritten: true,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    createdAt: '2025-11-22',
    tags: ['organic chemistry', 'class 12', 'NEET', 'reactions'],
  },
  {
    id: 'note_3',
    title: 'Indian Polity — UPSC Mains Complete Notes',
    subject: 'Political Science',
    educationLevel: 'Government Exam - UPSC',
    description: 'In-depth notes covering the Indian Constitution, governance, and political systems. Perfect for UPSC Mains preparation.',
    sellerId: 'user_4',
    price: 349,
    rating: 4.9,
    reviews: 890,
    downloads: 4200,
    pages: 210,
    isHandwritten: false,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    createdAt: '2025-10-05',
    tags: ['UPSC', 'polity', 'constitution', 'governance'],
  },
  {
    id: 'note_4',
    title: 'Class 10 Mathematics — All Chapters Solved',
    subject: 'Mathematics',
    educationLevel: 'Std 10',
    description: 'Complete solved examples and practice problems for all chapters of Class 10 CBSE Mathematics.',
    sellerId: 'user_5',
    price: 99,
    rating: 4.6,
    reviews: 156,
    downloads: 890,
    pages: 72,
    isHandwritten: true,
    hasDigitalized: false,
    thumbnail: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-01-15',
    tags: ['maths', 'class 10', 'CBSE', 'board exam'],
  },
  {
    id: 'note_5',
    title: 'Data Structures & Algorithms — Complete Notes',
    subject: 'Computer Science',
    educationLevel: "Bachelor's Degree",
    description: 'Detailed notes on all major data structures and algorithms with code examples in C++ and Python.',
    sellerId: 'user_2',
    price: 249,
    rating: 4.7,
    reviews: 278,
    downloads: 1560,
    pages: 156,
    isHandwritten: false,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910auj7?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-02-01',
    tags: ['DSA', 'programming', 'B.Tech', 'placement'],
  },
  {
    id: 'note_6',
    title: 'Biology — Human Physiology Notes for NEET',
    subject: 'Biology',
    educationLevel: 'Std 12 - Science',
    description: 'Detailed notes on Human Physiology with diagrams and NEET previous year question references.',
    sellerId: 'user_3',
    price: 179,
    rating: 4.8,
    reviews: 410,
    downloads: 3100,
    pages: 98,
    isHandwritten: true,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
    createdAt: '2025-09-18',
    tags: ['biology', 'NEET', 'human physiology', 'class 12'],
  },
  {
    id: 'note_7',
    title: 'SSC CGL Complete Reasoning & Aptitude',
    subject: 'Reasoning & Aptitude',
    educationLevel: 'Government Exam - SSC',
    description: 'Topic-wise reasoning and quantitative aptitude notes for SSC CGL preparation with shortcuts and tricks.',
    sellerId: 'user_4',
    price: 199,
    rating: 4.7,
    reviews: 320,
    downloads: 2800,
    pages: 140,
    isHandwritten: false,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-01-28',
    tags: ['SSC', 'CGL', 'reasoning', 'aptitude'],
  },
  {
    id: 'note_8',
    title: 'English Grammar & Composition — Std 8',
    subject: 'English',
    educationLevel: 'Std 8',
    description: 'Complete English grammar rules, tenses, and composition writing guide for Std 8 students.',
    sellerId: 'user_1',
    price: 79,
    rating: 4.5,
    reviews: 88,
    downloads: 420,
    pages: 48,
    isHandwritten: true,
    hasDigitalized: false,
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-03-10',
    tags: ['english', 'grammar', 'std 8', 'composition'],
  },
  {
    id: 'note_9',
    title: 'Accountancy — Partnership Accounts Full Notes',
    subject: 'Accountancy',
    educationLevel: 'Std 12 - Commerce',
    description: 'Detailed notes on Partnership Accounts with step-by-step solutions for all types of problems.',
    sellerId: 'user_2',
    price: 129,
    rating: 4.6,
    reviews: 190,
    downloads: 980,
    pages: 68,
    isHandwritten: true,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-02-20',
    tags: ['accountancy', 'commerce', 'class 12', 'partnership'],
  },
  {
    id: 'note_10',
    title: 'History of Modern India — UPSC Notes',
    subject: 'History',
    educationLevel: 'Government Exam - UPSC',
    description: 'Chronological notes covering Modern Indian History from 1757 to 1947 with important dates and events.',
    sellerId: 'user_4',
    price: 299,
    rating: 4.9,
    reviews: 670,
    downloads: 3800,
    pages: 180,
    isHandwritten: false,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?auto=format&fit=crop&w=600&q=80',
    createdAt: '2025-08-12',
    tags: ['history', 'UPSC', 'modern india', 'IAS'],
  },
];

// Helper: get seller info for a note
export const getSellerForNote = (note) => {
  return MOCK_USERS.find(u => u.id === note.sellerId) || null;
};

// Helper: get notes by seller
export const getNotesBySeller = (sellerId) => {
  return MOCK_NOTES.filter(n => n.sellerId === sellerId);
};

// Helper: get notes by education level
export const getNotesByLevel = (level) => {
  return MOCK_NOTES.filter(n => n.educationLevel === level);
};

// Helper: generate avatar initials
export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

// Helper: generate avatar color from string
export const getAvatarColor = (str) => {
  const colors = [
    'linear-gradient(135deg, #6C63FF, #a78bfa)',
    'linear-gradient(135deg, #FF6584, #ff8fab)',
    'linear-gradient(135deg, #43D9AD, #06b6d4)',
    'linear-gradient(135deg, #FFB84C, #f59e0b)',
    'linear-gradient(135deg, #ec4899, #f472b6)',
    'linear-gradient(135deg, #8b5cf6, #c084fc)',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Mock chat conversations
export const MOCK_CONVERSATIONS = [
  {
    id: 'conv_1',
    participantId: 'user_1',
    messages: [
      { id: 'm1', senderId: 'user_1', text: 'Hi! I saw you were interested in my Physics notes.', timestamp: '2026-04-10T10:30:00' },
      { id: 'm2', senderId: 'currentUser', text: 'Yes! Can you tell me more about the mechanics section?', timestamp: '2026-04-10T10:32:00' },
      { id: 'm3', senderId: 'user_1', text: 'Sure! It covers all chapters including rotational dynamics, gravitation, and fluid mechanics with solved numericals.', timestamp: '2026-04-10T10:35:00' },
    ]
  },
  {
    id: 'conv_2',
    participantId: 'user_4',
    messages: [
      { id: 'm4', senderId: 'currentUser', text: 'Are your UPSC polity notes updated for the latest amendments?', timestamp: '2026-04-12T14:00:00' },
      { id: 'm5', senderId: 'user_4', text: 'Yes, they include all amendments up to 2026. I update them every quarter.', timestamp: '2026-04-12T14:05:00' },
    ]
  }
];

// AI price prediction helper (simulated logic)
export const predictPrice = ({ pages, educationLevel, subject }) => {
  let basePrice = 49;

  // Page count factor
  if (pages > 150) basePrice += 200;
  else if (pages > 100) basePrice += 120;
  else if (pages > 50) basePrice += 60;
  else basePrice += 20;

  // Education level factor
  if (educationLevel.includes('Government Exam')) basePrice += 100;
  else if (educationLevel.includes("Master's") || educationLevel.includes('PhD')) basePrice += 80;
  else if (educationLevel.includes("Bachelor's")) basePrice += 50;
  else if (educationLevel.includes('12')) basePrice += 40;
  else if (educationLevel.includes('10')) basePrice += 20;

  // Subject demand factor
  const highDemand = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Reasoning & Aptitude'];
  if (highDemand.includes(subject)) basePrice += 30;

  return Math.round(basePrice / 10) * 10; // Round to nearest 10
};
