// ============================================================
// EDUMARKET — DATABASE SEED SCRIPT
// Run: node seed.js
// Seeds 5 users and 10 notes into MongoDB
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Note = require('./models/Note');

dotenv.config();

const USERS = [
  {
    fullName: 'Ananya Sharma',
    username: 'ananya_notes',
    email: 'ananya@example.com',
    password: 'password123',
    educationLevel: "Master's Degree",
    bio: 'MSc Physics | Passionate about making science accessible through handwritten notes. 4+ years of teaching experience.',
    notesUploaded: 2,
    totalDownloads: 1650,
    rating: 4.9,
  },
  {
    fullName: 'Rahul Verma',
    username: 'rahul_edu',
    email: 'rahul@example.com',
    password: 'password123',
    educationLevel: "Bachelor's Degree",
    bio: 'B.Tech CSE | I create detailed notes for competitive exams and college subjects.',
    notesUploaded: 2,
    totalDownloads: 2540,
    rating: 4.7,
  },
  {
    fullName: 'Priya Patel',
    username: 'priya_studies',
    email: 'priya@example.com',
    password: 'password123',
    educationLevel: 'Std 12 - Science',
    bio: 'NEET aspirant | Sharing my Biology & Chemistry notes that helped me score 680+.',
    notesUploaded: 2,
    totalDownloads: 5680,
    rating: 4.8,
  },
  {
    fullName: 'Amit Kumar Singh',
    username: 'amit_upsc',
    email: 'amit@example.com',
    password: 'password123',
    educationLevel: 'Government Exam - UPSC',
    bio: 'UPSC Mains qualified | Extensive notes on Indian Polity, History, and Geography.',
    notesUploaded: 3,
    totalDownloads: 10900,
    rating: 4.9,
  },
  {
    fullName: 'Sneha Reddy',
    username: 'sneha_maths',
    email: 'sneha@example.com',
    password: 'password123',
    educationLevel: 'Std 10',
    bio: 'Board topper | My math notes cover every chapter with solved examples. Sharing is caring!',
    notesUploaded: 1,
    totalDownloads: 1450,
    rating: 4.6,
  },
];

const NOTES_TEMPLATE = [
  {
    title: 'Complete Physics Mechanics — Handwritten Notes',
    subject: 'Physics',
    educationLevel: 'Std 12 - Science',
    description: 'Comprehensive handwritten notes covering all chapters of Mechanics for Class 12 Physics. Includes diagrams, derivations, and solved numericals.',
    sellerIndex: 0,
    price: 149,
    rating: 4.9,
    reviews: 342,
    downloads: 1230,
    pages: 86,
    isHandwritten: true,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    fileUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    tags: ['mechanics', 'physics', 'class 12', 'JEE', 'NEET'],
  },
  {
    title: 'Organic Chemistry Complete Guide',
    subject: 'Chemistry',
    educationLevel: 'Std 12 - Science',
    description: 'All named reactions, mechanisms, and important conversions for Organic Chemistry. Color-coded for quick revision.',
    sellerIndex: 2,
    price: 199,
    rating: 4.8,
    reviews: 518,
    downloads: 2340,
    pages: 124,
    isHandwritten: true,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    fileUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    tags: ['organic chemistry', 'class 12', 'NEET', 'reactions'],
  },
  {
    title: 'Indian Polity — UPSC Mains Complete Notes',
    subject: 'Political Science',
    educationLevel: 'Government Exam - UPSC',
    description: 'In-depth notes covering the Indian Constitution, governance, and political systems. Perfect for UPSC Mains preparation.',
    sellerIndex: 3,
    price: 349,
    rating: 4.9,
    reviews: 890,
    downloads: 4200,
    pages: 210,
    isHandwritten: false,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    tags: ['UPSC', 'polity', 'constitution', 'governance'],
  },
  {
    title: 'Class 10 Mathematics — All Chapters Solved',
    subject: 'Mathematics',
    educationLevel: 'Std 10',
    description: 'Complete solved examples and practice problems for all chapters of Class 10 CBSE Mathematics.',
    sellerIndex: 4,
    price: 99,
    rating: 4.6,
    reviews: 156,
    downloads: 890,
    pages: 72,
    isHandwritten: true,
    hasDigitalized: false,
    thumbnail: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=600&q=80',
    fileUrl: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=600&q=80',
    tags: ['maths', 'class 10', 'CBSE', 'board exam'],
  },
  {
    title: 'Data Structures & Algorithms — Complete Notes',
    subject: 'Computer Science',
    educationLevel: "Bachelor's Degree",
    description: 'Detailed notes on all major data structures and algorithms with code examples in C++ and Python.',
    sellerIndex: 1,
    price: 249,
    rating: 4.7,
    reviews: 278,
    downloads: 1560,
    pages: 156,
    isHandwritten: false,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910auj7?auto=format&fit=crop&w=600&q=80',
    fileUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910auj7?auto=format&fit=crop&w=600&q=80',
    tags: ['DSA', 'programming', 'B.Tech', 'placement'],
  },
  {
    title: 'Biology — Human Physiology Notes for NEET',
    subject: 'Biology',
    educationLevel: 'Std 12 - Science',
    description: 'Detailed notes on Human Physiology with diagrams and NEET previous year question references.',
    sellerIndex: 2,
    price: 179,
    rating: 4.8,
    reviews: 410,
    downloads: 3100,
    pages: 98,
    isHandwritten: true,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
    fileUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
    tags: ['biology', 'NEET', 'human physiology', 'class 12'],
  },
  {
    title: 'SSC CGL Complete Reasoning & Aptitude',
    subject: 'Reasoning & Aptitude',
    educationLevel: 'Government Exam - SSC',
    description: 'Topic-wise reasoning and quantitative aptitude notes for SSC CGL preparation with shortcuts and tricks.',
    sellerIndex: 3,
    price: 199,
    rating: 4.7,
    reviews: 320,
    downloads: 2800,
    pages: 140,
    isHandwritten: false,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    fileUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    tags: ['SSC', 'CGL', 'reasoning', 'aptitude'],
  },
  {
    title: 'English Grammar & Composition — Std 8',
    subject: 'English',
    educationLevel: 'Std 8',
    description: 'Complete English grammar rules, tenses, and composition writing guide for Std 8 students.',
    sellerIndex: 0,
    price: 79,
    rating: 4.5,
    reviews: 88,
    downloads: 420,
    pages: 48,
    isHandwritten: true,
    hasDigitalized: false,
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    fileUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    tags: ['english', 'grammar', 'std 8', 'composition'],
  },
  {
    title: 'Accountancy — Partnership Accounts Full Notes',
    subject: 'Accountancy',
    educationLevel: 'Std 12 - Commerce',
    description: 'Detailed notes on Partnership Accounts with step-by-step solutions for all types of problems.',
    sellerIndex: 1,
    price: 129,
    rating: 4.6,
    reviews: 190,
    downloads: 980,
    pages: 68,
    isHandwritten: true,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    tags: ['accountancy', 'commerce', 'class 12', 'partnership'],
  },
  {
    title: 'History of Modern India — UPSC Notes',
    subject: 'History',
    educationLevel: 'Government Exam - UPSC',
    description: 'Chronological notes covering Modern Indian History from 1757 to 1947 with important dates and events.',
    sellerIndex: 3,
    price: 299,
    rating: 4.9,
    reviews: 670,
    downloads: 3800,
    pages: 180,
    isHandwritten: false,
    hasDigitalized: true,
    thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?auto=format&fit=crop&w=600&q=80',
    fileUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?auto=format&fit=crop&w=600&q=80',
    tags: ['history', 'UPSC', 'modern india', 'IAS'],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Note.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const salt = await bcrypt.genSalt(10);
    const createdUsers = [];

    for (const userData of USERS) {
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const user = await User.create({
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        passwordHash: hashedPassword,
        educationLevel: userData.educationLevel,
        bio: userData.bio,
        notesUploaded: userData.notesUploaded,
        totalDownloads: userData.totalDownloads,
        rating: userData.rating,
      });
      createdUsers.push(user);
      console.log(`  ✅ Created user: ${user.fullName} (@${user.username})`);
    }

    // Create notes
    for (const noteData of NOTES_TEMPLATE) {
      const seller = createdUsers[noteData.sellerIndex];
      const note = await Note.create({
        title: noteData.title,
        subject: noteData.subject,
        educationLevel: noteData.educationLevel,
        description: noteData.description,
        sellerId: seller._id,
        price: noteData.price,
        rating: noteData.rating,
        reviews: noteData.reviews,
        downloads: noteData.downloads,
        pages: noteData.pages,
        isHandwritten: noteData.isHandwritten,
        hasDigitalized: noteData.hasDigitalized,
        thumbnail: noteData.thumbnail,
        fileUrl: noteData.fileUrl,
        tags: noteData.tags,
      });
      console.log(`  📝 Created note: ${note.title}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`   ${createdUsers.length} users created`);
    console.log(`   ${NOTES_TEMPLATE.length} notes created`);
    console.log('\n   Login with any user: password123');
    console.log('   Example: email=ananya@example.com password=password123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
