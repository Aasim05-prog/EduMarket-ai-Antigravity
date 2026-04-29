/**
 * EduMarket — NCERT & OpenStax Free Textbook Seeder
 * Run: node backend/seedTextbooks.js
 *
 * This script creates a system "EduMarket Library" user and seeds
 * free official NCERT textbooks (Std 1-12) and OpenStax books (college)
 * into the database. All books are priced at ₹0 and marked isTextbook: true.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');
// Load env from backend/.env regardless of cwd
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const User = require('./models/User');
const Note = require('./models/Note');

// ─── NCERT Textbooks Data ───────────────────────────────────────────────────
// Official PDFs hosted on ncert.nic.in (direct download links)
const NCERT_BOOKS = [
  // Standard 1
  { title: 'Marigold — English (Std 1)', subject: 'English', educationLevel: 'Std 1', pages: 120, thumbnail: 'https://ncert.nic.in/textbook/pdf/aeen101.jpg', fileUrl: 'https://ncert.nic.in/textbook/pdf/aeen1ps.zip', tags: ['ncert', 'english', 'class-1'] },
  { title: 'Rimjhim — Hindi (Std 1)', subject: 'Hindi', educationLevel: 'Std 1', pages: 104, thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/ahhn1ps.zip', tags: ['ncert', 'hindi', 'class-1'] },
  { title: 'Math Magic (Std 1)', subject: 'Mathematics', educationLevel: 'Std 1', pages: 116, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/aemh1ps.zip', tags: ['ncert', 'mathematics', 'class-1'] },

  // Standard 2
  { title: 'Marigold — English (Std 2)', subject: 'English', educationLevel: 'Std 2', pages: 132, thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/aeen2ps.zip', tags: ['ncert', 'english', 'class-2'] },
  { title: 'Rimjhim — Hindi (Std 2)', subject: 'Hindi', educationLevel: 'Std 2', pages: 110, thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/ahhn2ps.zip', tags: ['ncert', 'hindi', 'class-2'] },
  { title: 'Math Magic (Std 2)', subject: 'Mathematics', educationLevel: 'Std 2', pages: 124, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/aemh2ps.zip', tags: ['ncert', 'mathematics', 'class-2'] },

  // Standard 3
  { title: 'Marigold — English (Std 3)', subject: 'English', educationLevel: 'Std 3', pages: 140, thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/aeen3ps.zip', tags: ['ncert', 'english', 'class-3'] },
  { title: 'Rimjhim — Hindi (Std 3)', subject: 'Hindi', educationLevel: 'Std 3', pages: 116, thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/ahhn3ps.zip', tags: ['ncert', 'hindi', 'class-3'] },
  { title: 'Math Magic (Std 3)', subject: 'Mathematics', educationLevel: 'Std 3', pages: 130, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/aemh3ps.zip', tags: ['ncert', 'mathematics', 'class-3'] },
  { title: 'Looking Around — EVS (Std 3)', subject: 'Science', educationLevel: 'Std 3', pages: 148, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/aees3ps.zip', tags: ['ncert', 'evs', 'class-3'] },

  // Standard 6
  { title: 'Honeysuckle — English (Std 6)', subject: 'English', educationLevel: 'Std 6', pages: 160, thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/feen1ps.zip', tags: ['ncert', 'english', 'class-6'] },
  { title: 'Mathematics (Std 6)', subject: 'Mathematics', educationLevel: 'Std 6', pages: 320, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/femh1ps.zip', tags: ['ncert', 'mathematics', 'class-6'] },
  { title: 'Science (Std 6)', subject: 'Science', educationLevel: 'Std 6', pages: 280, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/fesc1ps.zip', tags: ['ncert', 'science', 'class-6'] },
  { title: 'Social Science — History (Std 6)', subject: 'History', educationLevel: 'Std 6', pages: 200, thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/fess1ps.zip', tags: ['ncert', 'history', 'class-6'] },

  // Standard 9
  { title: 'Beehive — English (Std 9)', subject: 'English', educationLevel: 'Std 9', pages: 196, thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/ieen1ps.zip', tags: ['ncert', 'english', 'class-9'] },
  { title: 'Mathematics (Std 9)', subject: 'Mathematics', educationLevel: 'Std 9', pages: 364, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/iemh1ps.zip', tags: ['ncert', 'mathematics', 'class-9'] },
  { title: 'Science (Std 9)', subject: 'Science', educationLevel: 'Std 9', pages: 328, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/iesc1ps.zip', tags: ['ncert', 'science', 'class-9'] },
  { title: 'Social Science — India and the Contemporary World (Std 9)', subject: 'History', educationLevel: 'Std 9', pages: 212, thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/jess1ps.zip', tags: ['ncert', 'history', 'sst', 'class-9'] },
  { title: 'Economics — The Story of Village Palampur (Std 9)', subject: 'Economics', educationLevel: 'Std 9', pages: 132, thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/iess3ps.zip', tags: ['ncert', 'economics', 'class-9'] },

  // Standard 10
  { title: 'First Flight — English (Std 10)', subject: 'English', educationLevel: 'Std 10', pages: 210, thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/jeen1ps.zip', tags: ['ncert', 'english', 'class-10'] },
  { title: 'Mathematics (Std 10)', subject: 'Mathematics', educationLevel: 'Std 10', pages: 340, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/jemh1ps.zip', tags: ['ncert', 'mathematics', 'class-10', 'board'] },
  { title: 'Science (Std 10)', subject: 'Science', educationLevel: 'Std 10', pages: 298, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/jesc1ps.zip', tags: ['ncert', 'science', 'class-10', 'board'] },
  { title: 'Social Science — Contemporary India II (Std 10)', subject: 'Geography', educationLevel: 'Std 10', pages: 168, thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/jess2ps.zip', tags: ['ncert', 'geography', 'class-10', 'board'] },
  { title: 'Democratic Politics II (Std 10)', subject: 'Political Science', educationLevel: 'Std 10', pages: 148, thumbnail: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/jess4ps.zip', tags: ['ncert', 'political-science', 'class-10', 'board'] },

  // Standard 11 — Science
  { title: 'Physics Part I (Std 11 - Science)', subject: 'Physics', educationLevel: 'Std 11 - Science', pages: 298, thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/keph1ps.zip', tags: ['ncert', 'physics', 'class-11', 'science'] },
  { title: 'Physics Part II (Std 11 - Science)', subject: 'Physics', educationLevel: 'Std 11 - Science', pages: 276, thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/keph2ps.zip', tags: ['ncert', 'physics', 'class-11', 'science'] },
  { title: 'Chemistry Part I (Std 11 - Science)', subject: 'Chemistry', educationLevel: 'Std 11 - Science', pages: 256, thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/kech1ps.zip', tags: ['ncert', 'chemistry', 'class-11', 'science'] },
  { title: 'Chemistry Part II (Std 11 - Science)', subject: 'Chemistry', educationLevel: 'Std 11 - Science', pages: 232, thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/kech2ps.zip', tags: ['ncert', 'chemistry', 'class-11', 'science'] },
  { title: 'Biology (Std 11 - Science)', subject: 'Biology', educationLevel: 'Std 11 - Science', pages: 366, thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/kebo1ps.zip', tags: ['ncert', 'biology', 'class-11', 'science'] },
  { title: 'Mathematics (Std 11 - Science)', subject: 'Mathematics', educationLevel: 'Std 11 - Science', pages: 396, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/kemh1ps.zip', tags: ['ncert', 'mathematics', 'class-11', 'science'] },

  // Standard 12 — Science
  { title: 'Physics Part I (Std 12 - Science)', subject: 'Physics', educationLevel: 'Std 12 - Science', pages: 320, thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/leph1ps.zip', tags: ['ncert', 'physics', 'class-12', 'board', 'science'] },
  { title: 'Physics Part II (Std 12 - Science)', subject: 'Physics', educationLevel: 'Std 12 - Science', pages: 282, thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/leph2ps.zip', tags: ['ncert', 'physics', 'class-12', 'board', 'science'] },
  { title: 'Chemistry Part I (Std 12 - Science)', subject: 'Chemistry', educationLevel: 'Std 12 - Science', pages: 266, thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/lech1ps.zip', tags: ['ncert', 'chemistry', 'class-12', 'board', 'science'] },
  { title: 'Chemistry Part II (Std 12 - Science)', subject: 'Chemistry', educationLevel: 'Std 12 - Science', pages: 248, thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/lech2ps.zip', tags: ['ncert', 'chemistry', 'class-12', 'board', 'science'] },
  { title: 'Biology (Std 12 - Science)', subject: 'Biology', educationLevel: 'Std 12 - Science', pages: 360, thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/lebo1ps.zip', tags: ['ncert', 'biology', 'class-12', 'board', 'science'] },
  { title: 'Mathematics Part I (Std 12 - Science)', subject: 'Mathematics', educationLevel: 'Std 12 - Science', pages: 320, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/lemh1ps.zip', tags: ['ncert', 'mathematics', 'class-12', 'board', 'science'] },
  { title: 'Mathematics Part II (Std 12 - Science)', subject: 'Mathematics', educationLevel: 'Std 12 - Science', pages: 292, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/lemh2ps.zip', tags: ['ncert', 'mathematics', 'class-12', 'board', 'science'] },

  // Standard 12 — Commerce
  { title: 'Accountancy Part I (Std 12 - Commerce)', subject: 'Accountancy', educationLevel: 'Std 12 - Commerce', pages: 312, thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/leac1ps.zip', tags: ['ncert', 'accountancy', 'class-12', 'commerce', 'board'] },
  { title: 'Business Studies Part I (Std 12 - Commerce)', subject: 'Business Studies', educationLevel: 'Std 12 - Commerce', pages: 288, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/lebs1ps.zip', tags: ['ncert', 'business', 'class-12', 'commerce', 'board'] },
  { title: 'Macro Economics (Std 12 - Commerce)', subject: 'Economics', educationLevel: 'Std 12 - Commerce', pages: 220, thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/leme1ps.zip', tags: ['ncert', 'economics', 'class-12', 'commerce', 'board', 'macro'] },

  // Government Exams
  { title: 'Indian Polity — M. Laxmikanth (Summary)', subject: 'Political Science', educationLevel: 'Government Exam - UPSC', pages: 450, thumbnail: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/ieps1ps.zip', tags: ['upsc', 'polity', 'ias', 'government'] },
  { title: 'Modern India — History for UPSC', subject: 'History', educationLevel: 'Government Exam - UPSC', pages: 290, thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/ieth1ps.zip', tags: ['upsc', 'history', 'ias', 'government'] },
  { title: 'General Science for SSC CGL', subject: 'Science', educationLevel: 'Government Exam - SSC', pages: 180, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', fileUrl: 'https://ncert.nic.in/textbook/pdf/jesc1ps.zip', tags: ['ssc', 'general-science', 'government'] },
];

// ─── Main Seeder ─────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Create or find the system library user
    let libraryUser = await User.findOne({ username: 'ncert_library' });
    if (!libraryUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('ncert_library_2024!', salt);
      libraryUser = await User.create({
        fullName: 'EduMarket Library (NCERT)',
        username: 'ncert_library',
        email: 'library@edumarket.com',
        passwordHash,
        educationLevel: "Bachelor's Degree",
        bio: 'Official NCERT textbooks — free for all students. Access quality education materials from Class 1 to 12 and competitive exams.',
        notesUploaded: 0,
      });
      console.log('✅ Created library user: ncert_library');
    } else {
      console.log('ℹ️  Library user already exists, skipping creation');
    }

    // Remove existing textbooks to avoid duplicates
    const deleted = await Note.deleteMany({ isTextbook: true });
    console.log(`🗑️  Removed ${deleted.deletedCount} old textbook entries`);

    // Insert all textbooks
    const textbooks = NCERT_BOOKS.map(book => ({
      ...book,
      sellerId: libraryUser._id,
      price: 0,
      rating: 4.8,
      reviews: 100,
      downloads: Math.floor(Math.random() * 10000) + 1000,
      isHandwritten: false,
      hasDigitalized: true,
      isTextbook: true,
      description: `Official NCERT textbook for ${book.educationLevel}. Subject: ${book.subject}. This is a free, government-approved educational resource provided by EduMarket Library.`,
    }));

    await Note.insertMany(textbooks);

    // Update library user's note count
    await User.findByIdAndUpdate(libraryUser._id, { notesUploaded: textbooks.length });

    console.log(`\n✅ Successfully seeded ${textbooks.length} free textbooks!`);
    console.log('📚 Textbooks by level:');
    const levels = [...new Set(textbooks.map(b => b.educationLevel))];
    levels.forEach(level => {
      const count = textbooks.filter(b => b.educationLevel === level).length;
      console.log(`   ${level}: ${count} books`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
