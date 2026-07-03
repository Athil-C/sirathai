import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  path: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    required: true,
  },
  pathSlug: {
    type: String,
    required: true,
  },
  order: { type: Number, required: true },
  // Lesson type determines the flow
  type: {
    type: String,
    enum: ['theory', 'quiz', 'worship_practice', 'recitation', 'milestone'],
    default: 'theory',
  },
  // Node display state info
  nodeType: {
    type: String,
    enum: ['lesson', 'milestone', 'bonus'],
    default: 'lesson',
  },
  // XP reward
  xpReward: { type: Number, default: 20 },
  coinReward: { type: Number, default: 5 },
  // Step 1: Learn content
  learnContent: {
    sections: [{
      heading: String,
      body: String,
      arabicText: String,
      transliteration: String,
      translation: String,
      imageUrl: String,
      icon: String,
    }],
  },
  // Step 2: Observe - animation/video
  observeContent: {
    title: String,
    description: String,
    videoUrl: String,
    animationUrl: String,
    steps: [{
      stepNumber: Number,
      title: String,
      description: String,
      imageUrl: String,
      icon: String,
    }],
  },
  // Step 3: Practice instructions
  practiceContent: {
    type: {
      type: String,
      enum: ['matching', 'flashcards', 'ordering', 'webcam_salah', 'webcam_wudu', 'voice_recitation', 'text_practice', 'drag_drop', 'none'],
      default: 'none',
    },
    instruction: String,
    // For matching
    pairs: [{ term: String, match: String }],
    // For flashcards
    cards: [{ front: String, back: String }],
    // For ordering
    words: [String],
    // For drag and drop
    dragItems: [{ id: String, text: String, zone: String }],
    dropZones: [{ id: String, label: String }],
    // Reference media
    referenceAudioUrl: String,
    referenceVideoUrl: String,
  },
  // Step 4: Quiz / evaluation
  quiz: [{
    question: String,
    type: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'fill_in', 'matching', 'ordering', 'drag_drop'],
      default: 'multiple_choice'
    },
    options: [String],
    correctAnswer: mongoose.Schema.Types.Mixed, // String for MCQ/TF/fill_in, Array for ordering
    explanation: String,
  }],
  passScore: { type: Number, default: 70 },
  // Step 5: Mastery challenge
  masteryChallenge: {
    enabled: { type: Boolean, default: false },
    timeLimit: { type: Number, default: 300 }, // seconds
    questions: [mongoose.Schema.Types.Mixed],
  },
  // Prerequisites
  prerequisite: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

lessonSchema.index({ path: 1, order: 1 });

export default mongoose.model('Lesson', lessonSchema);
