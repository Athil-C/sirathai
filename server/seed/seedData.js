import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root first, then server folder
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

import User from '../models/User.js';
import LearningPath from '../models/LearningPath.js';
import Lesson from '../models/Lesson.js';
import Achievement from '../models/Achievement.js';
import { CommunityPost } from '../models/Community.js';
import Progress from '../models/Progress.js';

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/siratai';

const paths = [
  { title:'Thareeq', slug:'thareeq', description:'Islamic way of life — daily Duas, Adhkar, Salah & Wudu training', icon:'🟢', color:'#10b981', gradient:'from-emerald-500 to-emerald-600', order:1, difficulty:'beginner', topics:['Daily Duas','Adhkar','Salah Training','Wudu Practice','Character','Halal & Haram'] },
  { title:'Fiqh', slug:'fiqh', description:'Islamic jurisprudence — Tahara, Salah rules, Fasting, Zakat, Hajj', icon:'🔵', color:'#3b82f6', gradient:'from-blue-500 to-blue-600', order:2, difficulty:'beginner', topics:['Tahara','Salah Rules','Fasting','Zakat','Hajj','Worship Practice'] },
  { title:'Quran', slug:'quran', description:'Quran recitation & memorization — Arabic alphabet, Tajweed, voice practice', icon:'🟡', color:'#f59e0b', gradient:'from-yellow-500 to-amber-600', order:3, difficulty:'beginner', topics:['Arabic Alphabet','Pronunciation','Tajweed','Reading','Voice Practice','Memorization'] },
  { title:'Aqeeda', slug:'aqeeda', description:'Islamic creed & belief — Tawheed, Allah\'s Names, Prophets, Angels, Hereafter', icon:'🟣', color:'#8b5cf6', gradient:'from-purple-500 to-purple-600', order:4, difficulty:'beginner', topics:['Tawheed','Allah\'s Names','Prophets','Angels','Divine Books','Hereafter'] },
];

function makeLessons(pathId, slug) {
  const bank = {
    thareeq: [
      { title:'Introduction to Islam', type:'theory', desc:'Learn the basics of Islam and its core teachings' },
      { title:'The Shahada', type:'theory', desc:'Understanding the declaration of faith' },
      { title:'Daily Duas - Morning', type:'theory', desc:'Morning supplications and remembrance' },
      { title:'Daily Duas - Evening', type:'theory', desc:'Evening supplications and protection duas' },
      { title:'Wudu - Theory', type:'theory', desc:'Learn the rules and steps of ablution', nodeType:'milestone' },
      { title:'Wudu - Animated Guide', type:'worship_practice', desc:'Watch and learn wudu step by step' },
      { title:'Wudu - Webcam Practice', type:'worship_practice', desc:'Practice wudu with AI verification' },
      { title:'Salah - Introduction', type:'theory', desc:'Understanding the importance of prayer' },
      { title:'Salah - Positions Guide', type:'worship_practice', desc:'Learn all salah positions with animations' },
      { title:'Salah - Full Practice', type:'worship_practice', desc:'Complete salah practice with webcam AI', nodeType:'milestone' },
      { title:'Swalath upon the Prophet ﷺ', type:'recitation', desc:'Learn and practice Swalath' },
      { title:'Islamic Character', type:'theory', desc:'Building good character in Islam' },
    ],
    fiqh: [
      { title:'What is Fiqh?', type:'theory', desc:'Introduction to Islamic jurisprudence' },
      { title:'Tahara - Purification', type:'theory', desc:'Rules and types of purification' },
      { title:'Types of Water', type:'theory', desc:'Which water is pure for worship' },
      { title:'Ghusl - Full Ablution', type:'theory', desc:'When and how to perform ghusl', nodeType:'milestone' },
      { title:'Salah Rules', type:'theory', desc:'Obligations and conditions of prayer' },
      { title:'Salah Practice Level', type:'worship_practice', desc:'Practice salah according to fiqh rules' },
      { title:'Fasting in Ramadan', type:'theory', desc:'Rules of fasting' },
      { title:'Zakat', type:'theory', desc:'Understanding obligatory charity' },
      { title:'Hajj Pilgrimage', type:'theory', desc:'The fifth pillar of Islam', nodeType:'milestone' },
    ],
    quran: [
      { title:'Arabic Alphabet - Part 1', type:'theory', desc:'Learn Alif to Tha' },
      { title:'Arabic Alphabet - Part 2', type:'theory', desc:'Learn Jim to Zay' },
      { title:'Vowel Marks (Harakat)', type:'theory', desc:'Fatha, Kasra, Damma' },
      { title:'Letter Connections', type:'theory', desc:'How letters connect in words', nodeType:'milestone' },
      { title:'Surah Al-Fatiha - Listen', type:'recitation', desc:'Listen to the opening chapter' },
      { title:'Surah Al-Fatiha - Recite', type:'recitation', desc:'Practice reciting Al-Fatiha' },
      { title:'Tajweed Basics', type:'theory', desc:'Rules of Quran recitation' },
      { title:'Surah Al-Ikhlas', type:'recitation', desc:'Learn and recite Surah Al-Ikhlas', nodeType:'milestone' },
    ],
    aqeeda: [
      { title:'What is Aqeeda?', type:'theory', desc:'Introduction to Islamic creed' },
      { title:'Tawheed - Oneness of Allah', type:'theory', desc:'The most fundamental belief' },
      { title:'Names of Allah - Part 1', type:'theory', desc:'Ar-Rahman, Ar-Raheem, Al-Malik' },
      { title:'Names of Allah - Part 2', type:'theory', desc:'As-Salam, Al-Mu\'min, Al-Aziz' },
      { title:'Belief in Angels', type:'theory', desc:'Created from light, obey Allah', nodeType:'milestone' },
      { title:'The Prophets', type:'theory', desc:'From Adam to Muhammad ﷺ' },
      { title:'Divine Books', type:'theory', desc:'Torah, Psalms, Gospel, Quran' },
      { title:'Day of Judgement', type:'theory', desc:'Signs, events, and the Hereafter' },
      { title:'Qadr - Divine Decree', type:'theory', desc:'Everything by Allah\'s will', nodeType:'milestone' },
    ],
  };

  const quizBank = [
    { question:'What is the correct answer?', type:'multiple_choice', options:['Option A','Option B','Option C','Option D'], correctAnswer:'Option B', explanation:'Option B is the correct answer for this topic.' },
    { question:'True or False: Islam means submission to Allah.', type:'true_false', options:['True','False'], correctAnswer:'True', explanation:'Islam means peace and submission.' },
    { question:'The first pillar of Islam is ___', type:'fill_in', options:[], correctAnswer:'Shahada', explanation:'The Shahada is the declaration of faith.' },
  ];

  const practiceTypes = ['matching','flashcards','ordering'];

  return (bank[slug]||[]).map((l, i) => ({
    title: l.title,
    description: l.desc,
    path: pathId,
    pathSlug: slug,
    order: i + 1,
    type: l.type,
    nodeType: l.nodeType || 'lesson',
    xpReward: l.nodeType === 'milestone' ? 50 : 25,
    coinReward: l.nodeType === 'milestone' ? 15 : 5,
    learnContent: {
      sections: [
        { heading: `Understanding ${l.title}`, body: `This lesson covers the fundamentals of ${l.title}. ${l.desc}. Islam is a complete way of life that provides guidance for every aspect of human existence.`, icon: '📖' },
        { heading: 'Key Concepts', body: `In this section, we explore the important concepts related to ${l.title}. Each concept builds upon the previous one, creating a solid foundation of knowledge.`, icon: '💡' },
        { heading: 'Practical Application', body: `Now let us understand how ${l.title} applies to your daily life as a Muslim. These teachings are meant to be lived, not just learned.`, icon: '✨' },
      ],
    },
    observeContent: {
      title: `Observing ${l.title}`,
      description: `Visual walkthrough of ${l.title} concepts and practices.`,
      steps: [
        { stepNumber:1, title:'Step 1: Foundation', description:`Begin with the basics of ${l.title}`, icon:'1️⃣' },
        { stepNumber:2, title:'Step 2: Understanding', description:'Deepen your comprehension', icon:'2️⃣' },
        { stepNumber:3, title:'Step 3: Connection', description:'See how it connects to daily life', icon:'3️⃣' },
        { stepNumber:4, title:'Step 4: Reflection', description:'Reflect on what you have learned', icon:'4️⃣' },
      ],
    },
    practiceContent: {
      type: practiceTypes[i % 3],
      instruction: `Practice what you learned about ${l.title}:`,
      pairs: [
        { term:'Concept 1', match:'Definition 1' },
        { term:'Concept 2', match:'Definition 2' },
        { term:'Concept 3', match:'Definition 3' },
      ],
      cards: [
        { front:'بسم الله', back:'In the name of Allah' },
        { front:'الحمد لله', back:'All praise is due to Allah' },
        { front:'الله أكبر', back:'Allah is the Greatest' },
        { front:'سبحان الله', back:'Glory be to Allah' },
      ],
      words: ['First','Second','Third','Fourth','Fifth'],
    },
    quiz: quizBank.map(q => ({...q})),
    passScore: 70,
    masteryChallenge: {
      enabled: l.nodeType === 'milestone',
      timeLimit: 180,
      questions: [
        { question:`Master question for ${l.title}`, type:'multiple_choice', options:['A','B','C','D'], correctAnswer:'A' },
      ],
    },
    isActive: true,
  }));
}

const achievements = [
  { title:'First Steps', description:'Complete your first lesson', icon:'🎯', category:'learning', condition:{ type:'lessons_completed', value:1 }, xpReward:25, coinReward:10 },
  { title:'Scholar', description:'Complete 5 lessons', icon:'📚', category:'learning', condition:{ type:'lessons_completed', value:5 }, xpReward:50, coinReward:25 },
  { title:'Knowledge Seeker', description:'Complete 10 lessons', icon:'🎓', category:'learning', condition:{ type:'lessons_completed', value:10 }, xpReward:100, coinReward:50 },
  { title:'Dedicated Learner', description:'Complete 25 lessons', icon:'🏆', category:'milestone', condition:{ type:'lessons_completed', value:25 }, xpReward:200, coinReward:100 },
  { title:'Flame Starter', description:'3 day streak', icon:'🔥', category:'streak', condition:{ type:'streak_days', value:3 }, xpReward:30, coinReward:15 },
  { title:'On Fire', description:'7 day streak', icon:'🔥', category:'streak', condition:{ type:'streak_days', value:7 }, xpReward:75, coinReward:40 },
  { title:'Unstoppable', description:'30 day streak', icon:'💪', category:'streak', condition:{ type:'streak_days', value:30 }, xpReward:200, coinReward:100 },
  { title:'Rising Star', description:'Reach level 5', icon:'⭐', category:'milestone', condition:{ type:'level_reached', value:5 }, xpReward:50, coinReward:25 },
  { title:'Shining Light', description:'Reach level 10', icon:'🌟', category:'milestone', condition:{ type:'level_reached', value:10 }, xpReward:100, coinReward:50 },
  { title:'XP Hunter', description:'Earn 500 XP', icon:'💎', category:'milestone', condition:{ type:'xp_earned', value:500 }, xpReward:50, coinReward:30 },
  { title:'XP Master', description:'Earn 2000 XP', icon:'👑', category:'milestone', condition:{ type:'xp_earned', value:2000 }, xpReward:150, coinReward:75 },
  { title:'Community Voice', description:'Create 3 posts', icon:'💬', category:'community', condition:{ type:'posts_created', value:3 }, xpReward:40, coinReward:20 },
];

const communityPosts = [
  { community:'thareeq', title:'How to maintain khushoo in Salah?', content:'I recently accepted Islam and find it hard to concentrate during prayers. What tips can you share to maintain focus and presence during Salah? JazakAllahu khairan.' },
  { community:'thareeq', title:'Best morning adhkar routine?', content:'I want to start my mornings with proper Islamic remembrance. What are the essential morning duas and adhkar that I should recite daily?' },
  { community:'fiqh', title:'Wudu steps clarification', content:'Do I need to wash my feet in a specific order during wudu? Also, is wiping over socks (khuffs) permissible in all madhabs?' },
  { community:'fiqh', title:'Can I combine prayers when traveling?', content:'I will be traveling for work next week. What are the rules about shortening and combining prayers during travel?' },
  { community:'quran', title:'Tips for memorizing Surah Al-Baqarah?', content:'I have memorized Juz Amma and want to start Surah Al-Baqarah. Any tips for memorizing longer surahs effectively?' },
  { community:'quran', title:'Tajweed mistakes I keep making', content:'I struggle with the ghunnah and idgham rules. How can I improve my tajweed and avoid common pronunciation errors?' },
  { community:'aqeeda', title:'Understanding Qadr (Divine Decree)', content:'How do we reconcile belief in divine decree with free will? This is something I have been thinking about deeply.' },
  { community:'aqeeda', title:'Names of Allah for daily reflection', content:'Which names of Allah are recommended to reflect upon daily? How can understanding His names improve our connection with Him?' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      LearningPath.deleteMany({}),
      Lesson.deleteMany({}),
      Achievement.deleteMany({}),
      CommunityPost.deleteMany({}),
      Progress.deleteMany({}),
    ]);
    console.log('🗑️  Cleared old data');

    // Create paths
    const createdPaths = await LearningPath.insertMany(paths);
    console.log(`📚 Created ${createdPaths.length} learning paths`);

    // Create lessons for each path
    let totalLessons = 0;
    for (const p of createdPaths) {
      const lessons = makeLessons(p._id, p.slug);
      if (lessons.length) {
        await Lesson.insertMany(lessons);
        p.totalLessons = lessons.length;
        await p.save();
        totalLessons += lessons.length;
      }
    }
    console.log(`📖 Created ${totalLessons} lessons`);

    // Create achievements
    await Achievement.insertMany(achievements);
    console.log(`🏆 Created ${achievements.length} achievements`);

    // Create test user if none exists
    let testUser = await User.findOne({ email: 'test@siratai.com' });
    if (!testUser) {
      testUser = await User.create({ name:'Test Student', email:'test@siratai.com', password:'test123', role:'student', onboardingComplete:true, journeyType:'new_muslim', xp:150, level:2, coins:45, streak:3 });
      console.log('👤 Created test student: test@siratai.com / test123');
    }

    let mufti = await User.findOne({ email: 'mufti@siratai.com' });
    if (!mufti) {
      mufti = await User.create({ name:'Mufti Ahmad', email:'mufti@siratai.com', password:'mufti123', role:'mufti', muftiCategory:'thareeq', isVerifiedMufti:true, onboardingComplete:true });
      console.log('🕌 Created test mufti: mufti@siratai.com / mufti123');
    }

    let admin = await User.findOne({ email: 'admin@siratai.com' });
    if (!admin) {
      admin = await User.create({ name:'Admin', email:'admin@siratai.com', password:'admin123', role:'admin', onboardingComplete:true, xp:500, level:5, coins:200 });
      console.log('🔧 Created test admin: admin@siratai.com / admin123');
    }

    // Create some test learners for leaderboard
    const testLearners = [
      { name:'Abdullah', email:'abdullah@test.com', xp:4520, level:45, streak:67, coins:890 },
      { name:'Fatima', email:'fatima@test.com', xp:3980, level:39, streak:45, coins:670 },
      { name:'Yusuf', email:'yusuf@test.com', xp:3540, level:35, streak:30, coins:550 },
      { name:'Aisha', email:'aisha@test.com', xp:3100, level:31, streak:28, coins:480 },
      { name:'Ibrahim', email:'ibrahim@test.com', xp:2800, level:28, streak:21, coins:400 },
      { name:'Maryam', email:'maryam@test.com', xp:2500, level:25, streak:19, coins:350 },
      { name:'Omar', email:'omar@test.com', xp:2200, level:22, streak:15, coins:300 },
      { name:'Khadijah', email:'khadijah@test.com', xp:1900, level:19, streak:12, coins:250 },
    ];

    for (const tl of testLearners) {
      const exists = await User.findOne({ email: tl.email });
      if (!exists) {
        await User.create({ ...tl, password:'test123', role:'student', onboardingComplete:true, lastActiveDate: new Date() });
      }
    }
    console.log('👥 Created test learners for leaderboard');

    // Create community posts
    for (const post of communityPosts) {
      await CommunityPost.create({ ...post, author: testUser._id });
    }
    console.log(`💬 Created ${communityPosts.length} community posts`);

    // Create some progress for test user (first 2 lessons of thareeq completed)
    const thareeqPath = createdPaths.find(p => p.slug === 'thareeq');
    const thareeqLessons = await Lesson.find({ path: thareeqPath._id }).sort({ order: 1 }).limit(2);
    for (const lesson of thareeqLessons) {
      await Progress.create({
        user: testUser._id,
        lesson: lesson._id,
        path: thareeqPath._id,
        status: 'completed',
        stepsCompleted: { learn:true, observe:true, practice:true, evaluate:true, mastery:true },
        quizScore: 90,
        quizAttempts: 1,
        xpEarned: lesson.xpReward,
        completedAt: new Date(),
      });
      if (!testUser.completedLessons.includes(lesson._id)) {
        testUser.completedLessons.push(lesson._id);
      }
    }
    await testUser.save();
    console.log('📊 Created progress records for test user');

    console.log('\n🎉 Seed complete! Test accounts:');
    console.log('   Student: test@siratai.com / test123');
    console.log('   Mufti:   mufti@siratai.com / mufti123');
    console.log('   Admin:   admin@siratai.com / admin123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
