export type AppMode = 'focus' | 'gaming' | 'chill';

export type PillarId = 'study' | 'gaming' | 'routine' | 'companion' | 'admin';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  xp: number;
  level: number;
  streak: number;
  createdAt: string;
  updatedAt?: string;
}

export interface StudyLeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  totalSeconds: number;
  todaySeconds: number;
  weekSeconds: number;
  lastActiveDate: string; // YYYY-MM-DD
  weekIdentifier?: string; // YYYY-WW
  isStudying?: boolean;
  lastHeartbeat?: number;
  level?: number;
  streak?: number;
  updatedAt?: string;
}

export interface ProblemDataAnalysis {
  subject: string;
  category: string;
  gradeLevel: string;
  problemType: 'multiple_choice' | 'calculation' | 'proof' | 'essay_analysis' | 'code' | 'other';
  givenData: string[];
  targetRequirements: string[];
  problemSummary: string;
}

export interface AppliedFormula {
  name: string;
  formula: string;
  explanation: string;
}

export interface SolutionStep {
  stepNumber: number;
  title: string;
  detail: string;
  mathExpression?: string;
  notes?: string;
}

export interface UniversalSolverResult {
  analysis: ProblemDataAnalysis;
  exactAnswer: string;
  answerChoice?: string;
  answerSummary: string;
  coreFormulas: AppliedFormula[];
  detailedSteps: SolutionStep[];
  verification: string;
  commonTraps: string[];
  similarExercises: {
    question: string;
    hint: string;
    answer: string;
  }[];
  requestId?: string;
  provider?: string;
  model?: string;
  latencyMs?: number;
  trustStatus?: 'verified' | 'unverified' | 'no_sources' | 'not_configured' | 'error';
  citations?: Array<{
    id: string;
    title: string;
    domain: string;
    snippet: string;
    trustLevel: string;
    dateVerified?: string;
    version?: string;
    platform?: string;
  }>;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorEmail: string;
  priority: 'low' | 'normal' | 'urgent';
  createdAt: string;
}

export interface MathStep {
  step: number;
  title: string;
  explanation: string;
}

export interface SimilarExercise {
  title: string;
  problem: string;
  hint: string;
  answer?: string;
}

export interface EnglishVocabularyItem {
  word: string;
  ipa: string;
  meaning: string;
  collocation?: string;
}

export interface EnglishStep {
  step: number;
  title: string;
  detail: string;
}

export interface EnglishSimilarExercise {
  question: string;
  hint: string;
  answer?: string;
}

export interface EnglishSolverResult {
  exerciseCategory: string;
  difficulty: string;
  correctAnswer: string;
  fullTranslation: string;
  grammarRule: string;
  explanationSteps: EnglishStep[];
  examTraps: string[];
  keyVocabulary: EnglishVocabularyItem[];
  similarExercises: EnglishSimilarExercise[];
}

export interface EnglishWritingResult {
  originalText: string;
  correctedText: string;
  nativePolishedText: string;
  overallScore: number;
  grammarErrors: {
    original: string;
    correction: string;
    explanation: string;
  }[];
  vocabularyUpgrades: {
    basicWord: string;
    advancedAlternative: string;
    exampleSentence: string;
  }[];
  cohesionTips: string;
}

export interface MathResult {
  category: string;
  difficulty: string;
  coreFormula: string;
  methodExplanation: string;
  steps: MathStep[];
  finalAnswer: string;
  commonTraps: string[];
  similarExercises: SimilarExercise[];
}

export interface OutlineSection {
  section: string;
  mainIdea: string;
  arguments: string[];
  evidence: string;
  vividPhrases: string[];
}

export interface SuggestedVocab {
  word: string;
  meaning: string;
  sampleSentence: string;
}

export interface WritingResult {
  topic: string;
  hook: string;
  uniquePerspective: string;
  outline: OutlineSection[];
  suggestedVocab: SuggestedVocab[];
  expressionPolishTips: string[];
  sampleExcerpt: string;
}

export interface MindmapBranch {
  title: string;
  color?: string;
  subBranches: string[];
}

export type LiteratureEducationLevel = 'auto' | 'primary' | 'secondary' | 'high_school' | 'university' | 'master';

export interface LiteratureResult {
  educationLevelTarget: string;
  promptAnalysis: {
    requestSummary: string;
    approachDirection: string;
    knowledgeScope: string;
    foundationalData: string;
  };
  detailedWork: {
    title: string;
    introduction: string;
    bodyParagraphs: Array<{
      heading: string;
      content: string;
      quoteOrEvidence?: string;
    }>;
    counterArgumentOrExtension?: string;
    conclusion: string;
    fullText: string;
  };
  academicHighlights: {
    keywordsAndTheories: string[];
    breakthroughPoints: string[];
    comparativeConnections: string[];
    examinerNote: string;
  };
  stepByStepProcess: {
    step1_infoGathering: string;
    step2_initialDraft: string;
    step3_critiqueAndRefine: string;
  };
}

export interface FlashcardItem {
  id: number;
  tag: string;
  question: string;
  answer: string;
}

export interface SummarizeResult {
  summaryOverview: string;
  keyTakeaways: string[];
  mindmap: {
    root: string;
    branches: MindmapBranch[];
  };
  flashcards: FlashcardItem[];
}

export interface BuildRecommendation {
  championOrRole: string;
  tier: string;
  coreItems: string;
  strategy: string;
  counterTips: string;
}

export interface RelaxGame {
  title: string;
  genre: string;
  why: string;
}

export interface GamingStrategyResult {
  gameTitle: string;
  metaOverview: string;
  bestBuilds: BuildRecommendation[];
  rankClimbingHabits: string[];
  gameLifeBalanceAdvice: string;
  recommendedChillGames: RelaxGame[];
}

export interface MemoryHighlight {
  id: string;
  title: string;
  category: 'game_highlight' | 'quote' | 'movie' | 'study_milestone';
  content: string;
  authorOrSource?: string;
  date: string;
  moodTag: string;
  imageUrl?: string;
}

export interface RoutineSlot {
  id: string;
  time: string;
  title: string;
  category: string;
  mode: AppMode;
  xp: number;
  description: string;
  completed?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  category: 'study' | 'home' | 'project' | 'health';
  priority: 'low' | 'medium' | 'high';
  xp: number;
  completed: boolean;
  dueDate?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
}

export interface HabitItem {
  id: string;
  title: string;
  iconName: string;
  currentCount: number;
  targetCount: number;
  unit: string;
  streak: number;
  lastUpdated: string;
}

export type CompanionPersona = 'empathy' | 'strict_coach' | 'witty_mentor' | 'super_ai';

export interface CompanionMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  detectedMood?: string;
  suggestedAction?: string;
  mindsetTip?: string;
}

export interface EnglishQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  grammarFocus: string;
  difficulty: string;
}

export interface EnglishQuizSummary {
  quizTitle: string;
  topic: string;
  difficulty: string;
  totalQuestions: number;
  score: number;
  earnedXp: number;
  questions: EnglishQuizQuestion[];
  userAnswers: Record<number, number>;
  feedback: string;
  completedAt: string;
}
