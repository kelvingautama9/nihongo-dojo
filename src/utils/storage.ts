import { QuestionCategory } from '../data/questionBank';

export interface ItemMasteryStat {
  itemId: string;
  label: string;
  romaji: string;
  category: QuestionCategory;
  attempts: number;
  correct: number;
  totalTimeMs: number;
  lastSeen: string;
}

export interface DailyProgressEntry {
  date: string; // YYYY-MM-DD
  questionsAnswered: number;
  correctCount: number;
  totalTimeMs: number;
  sessionsCompleted: number;
}

export interface MistakeBankEntry {
  questionId: string;
  stimulus: string;
  correctAnswer: string;
  category: QuestionCategory;
  explanation: string;
  missCount: number;
  lastMissedAt: string;
}

export interface TestHistoryRecord {
  id: string;
  timestamp: string;
  levelLabel: string;
  modeLabel: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  grade: 'S' | 'A' | 'B' | 'C';
  avgTimeSec: number;
  categoryBreakdown: Record<QuestionCategory, { correct: number; total: number }>;
}

export interface DojoUserState {
  currentSenseiLevel: 1 | 2 | 3 | 4 | 5;
  manualLevelOverride: number | null; // Allows student/assessor to test High Level (No Romaji) anytime
  totalXp: number;
  streakDays: number;
  lastStudyDate: string | null;
  itemStats: Record<string, ItemMasteryStat>;
  dailyLogs: Record<string, DailyProgressEntry>;
  mistakeBank: Record<string, MistakeBankEntry>;
  testHistory: TestHistoryRecord[];
}

const STORAGE_KEY = 'nihongo_dojo_v1_state';

function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getInitialDojoState(): DojoUserState {
  if (typeof window === 'undefined') {
    return createEmptyState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createEmptyState();
    }
    const parsed = JSON.parse(raw) as DojoUserState;
    return {
      ...createEmptyState(),
      ...parsed,
    };
  } catch {
    return createEmptyState();
  }
}

export function createEmptyState(): DojoUserState {
  return {
    currentSenseiLevel: 1,
    manualLevelOverride: null,
    totalXp: 0,
    streakDays: 0,
    lastStudyDate: null,
    itemStats: {},
    dailyLogs: {},
    mistakeBank: {},
    testHistory: [],
  };
}

export function saveDojoState(state: DojoUserState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function computeSenseiLevel(state: DojoUserState): 1 | 2 | 3 | 4 | 5 {
  if (state.manualLevelOverride && state.manualLevelOverride >= 1 && state.manualLevelOverride <= 5) {
    return state.manualLevelOverride as 1 | 2 | 3 | 4 | 5;
  }

  const xp = state.totalXp;
  if (xp >= 1200) return 5;
  if (xp >= 700) return 4;
  if (xp >= 350) return 3;
  if (xp >= 120) return 2;
  return 1;
}

export function getSenseiLevelMeta(level: 1 | 2 | 3 | 4 | 5) {
  const meta: Record<
    1 | 2 | 3 | 4 | 5,
    {
      title: string;
      badge: string;
      subtitle: string;
      romajiPolicy: string;
      nextTargetXp: number;
    }
  > = {
    1: {
      title: 'Level 1 · Shoshinsha (Pemula Hiragana)',
      badge: 'LV 1',
      subtitle: 'Fokus hafalan deret standar Hiragana A-I-U-E-O s.d. WA-WO-N dengan bantuan Romaji.',
      romajiPolicy: 'Bantuan Romaji & arti kata ditampilkan penuh',
      nextTargetXp: 120,
    },
    2: {
      title: 'Level 2 · Katakana & Gairaigo',
      badge: 'LV 2',
      subtitle: 'Penguasaan 46 Katakana dasar dan kosakata serapan asing (Arubaito, Enjinia).',
      romajiPolicy: 'Bantuan Romaji aktif untuk kalimat kontekstual',
      nextTargetXp: 350,
    },
    3: {
      title: 'Level 3 · Modifikasi Bunyi (Sokuon & Chouon)',
      badge: 'LV 3',
      subtitle: 'Pemantapan ketukan っ/ッ kecil, vokal panjang, Dakuon, dan Youon.',
      romajiPolicy: 'Bantuan Romaji transisi (kata per kata)',
      nextTargetXp: 700,
    },
    4: {
      title: 'Level 4 · Konteks Kalimat MNN (Tanpa Romaji)',
      badge: 'LV 4',
      subtitle: 'Penyusunan kalimat Minna no Nihongo Bab 1–5. Contoh Romaji kalimat disembunyikan otomatis.',
      romajiPolicy: 'Mode Level Tinggi: Romaji disembunyikan, hanya Kana & Arti Indonesia',
      nextTargetXp: 1200,
    },
    5: {
      title: 'Level 5 · JFT-Basic / JLPT N5 Ready',
      badge: 'LV 5',
      subtitle: 'Hafal di luar kepala (< 3 detik/soal) tanpa bantuan alfabet Romaji.',
      romajiPolicy: 'Simulasi Asli JLPT/JFT: Murni Huruf Jepang & Tata Bahasa',
      nextTargetXp: 2000,
    },
  };
  return meta[level];
}

export function recordSingleAnswer(
  prevState: DojoUserState,
  params: {
    questionId: string;
    stimulus: string;
    romaji: string;
    category: QuestionCategory;
    isCorrect: boolean;
    responseTimeMs: number;
    explanation: string;
    isSessionComplete?: boolean;
  }
): DojoUserState {
  const today = getTodayIso();
  const nextState: DojoUserState = {
    ...prevState,
    itemStats: { ...prevState.itemStats },
    dailyLogs: { ...prevState.dailyLogs },
    mistakeBank: { ...prevState.mistakeBank },
  };

  // Update streak
  if (nextState.lastStudyDate !== today) {
    if (nextState.lastStudyDate) {
      const prevDate = new Date(nextState.lastStudyDate);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      nextState.streakDays = diffDays === 1 ? nextState.streakDays + 1 : 1;
    } else {
      nextState.streakDays = 1;
    }
    nextState.lastStudyDate = today;
  }

  // Update XP (faster & accurate answers yield higher XP)
  const speedBonus = params.isCorrect && params.responseTimeMs <= 3000 ? 6 : params.isCorrect ? 4 : 1;
  nextState.totalXp += speedBonus;

  // Update Item Mastery Stat
  const existingItem = nextState.itemStats[params.questionId] || {
    itemId: params.questionId,
    label: params.stimulus,
    romaji: params.romaji,
    category: params.category,
    attempts: 0,
    correct: 0,
    totalTimeMs: 0,
    lastSeen: today,
  };

  nextState.itemStats[params.questionId] = {
    ...existingItem,
    attempts: existingItem.attempts + 1,
    correct: existingItem.correct + (params.isCorrect ? 1 : 0),
    totalTimeMs: existingItem.totalTimeMs + Math.min(params.responseTimeMs, 30000),
    lastSeen: new Date().toISOString(),
  };

  // Update Daily Log
  const existingDay = nextState.dailyLogs[today] || {
    date: today,
    questionsAnswered: 0,
    correctCount: 0,
    totalTimeMs: 0,
    sessionsCompleted: 0,
  };

  nextState.dailyLogs[today] = {
    ...existingDay,
    questionsAnswered: existingDay.questionsAnswered + 1,
    correctCount: existingDay.correctCount + (params.isCorrect ? 1 : 0),
    totalTimeMs: existingDay.totalTimeMs + Math.min(params.responseTimeMs, 30000),
    sessionsCompleted: existingDay.sessionsCompleted + (params.isSessionComplete ? 1 : 0),
  };

  // Update Mistake Bank
  if (!params.isCorrect) {
    const existingMistake = nextState.mistakeBank[params.questionId];
    nextState.mistakeBank[params.questionId] = {
      questionId: params.questionId,
      stimulus: params.stimulus,
      correctAnswer: params.romaji,
      category: params.category,
      explanation: params.explanation,
      missCount: (existingMistake?.missCount || 0) + 1,
      lastMissedAt: new Date().toISOString(),
    };
  } else if (nextState.mistakeBank[params.questionId]) {
    // If answered correctly in retry/practice, reduce miss count or clear if mastered
    const currentMiss = nextState.mistakeBank[params.questionId];
    if (currentMiss.missCount <= 1) {
      delete nextState.mistakeBank[params.questionId];
    } else {
      nextState.mistakeBank[params.questionId] = {
        ...currentMiss,
        missCount: currentMiss.missCount - 1,
      };
    }
  }

  nextState.currentSenseiLevel = computeSenseiLevel(nextState);
  saveDojoState(nextState);
  return nextState;
}

export function recordCompletedTestSession(
  prevState: DojoUserState,
  record: TestHistoryRecord
): DojoUserState {
  const today = getTodayIso();
  const existingDay = prevState.dailyLogs[today] || {
    date: today,
    questionsAnswered: 0,
    correctCount: 0,
    totalTimeMs: 0,
    sessionsCompleted: 0,
  };

  let nextStreak = prevState.streakDays;
  if (prevState.lastStudyDate !== today) {
    if (prevState.lastStudyDate) {
      const prevDate = new Date(prevState.lastStudyDate);
      const currDate = new Date(today);
      const diffDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      nextStreak = diffDays === 1 ? prevState.streakDays + 1 : 1;
    } else {
      nextStreak = 1;
    }
  } else if (nextStreak === 0) {
    nextStreak = 1;
  }

  const nextState: DojoUserState = {
    ...prevState,
    streakDays: nextStreak,
    lastStudyDate: today,
    dailyLogs: {
      ...prevState.dailyLogs,
      [today]: {
        ...existingDay,
        sessionsCompleted: existingDay.sessionsCompleted + 1,
      },
    },
    testHistory: [record, ...prevState.testHistory].slice(0, 30),
  };

  nextState.currentSenseiLevel = computeSenseiLevel(nextState);
  saveDojoState(nextState);
  return nextState;
}

export function calculateGrade(scorePercent: number): {
  grade: 'S' | 'A' | 'B' | 'C';
  statusText: string;
  recommendation: string;
} {
  if (scorePercent >= 95) {
    return {
      grade: 'S',
      statusText: 'Lulus Sempurna — Siap Masuk Minna no Nihongo Bab 1–5',
      recommendation: 'Hafalan Anda sudah sangat tajam. Pertahankan kecepatan jawab di bawah 3 detik pada Mode Esai.',
    };
  }
  if (scorePercent >= 85) {
    return {
      grade: 'A',
      statusText: 'Lulus Standar — Memenuhi Kriteria Dasar JFT/JLPT',
      recommendation: 'Akurasi sudah baik, namun segera bersihkan sisa huruf yang salah di Bank Kesalahan agar tidak terbawa ke bab berikutnya.',
    };
  }
  if (scorePercent >= 75) {
    return {
      grade: 'B',
      statusText: 'Rawan Lupa — Perlu Penguatan Active Recall',
      recommendation: 'Masih ada huruf mirip atau ketukan Sokuon/Chouon yang tertukar. Wajib latih ulang di Mode Esai (Ketik Mandiri).',
    };
  }
  return {
    grade: 'C',
    statusText: 'Wajib Mengulang — Dilarang Lanjut Bab Baru',
    recommendation: 'Fondasi Kana atau modifikasi bunyi belum stabil. Fokuskan latihan pada Deret Standar dan Modul Sokuon/Chouon sebelum lanjut.',
  };
}

export type AchievementRankId =
  | 'warrior'
  | 'elite'
  | 'master'
  | 'grandmaster'
  | 'epic'
  | 'legend'
  | 'mythic';

export interface AchievementRankTier {
  id: AchievementRankId;
  name: string;
  jpTitle: string;
  minCorrect: number;
  nextMinCorrect: number | null;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentColor: string;
  description: string;
}

export const ACHIEVEMENT_RANKS: AchievementRankTier[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    jpTitle: '戦士 · Senshi',
    minCorrect: 0,
    nextMinCorrect: 25,
    badgeBg: 'bg-[#F4EFE6]',
    badgeText: 'text-[#5C554E]',
    badgeBorder: 'border-[#D5CBB8]',
    accentColor: '#786B5E',
    description: 'Langkah awal menguasai deret Hiragana & Katakana dasar.',
  },
  {
    id: 'elite',
    name: 'Elite',
    jpTitle: '精鋭 · Seiei',
    minCorrect: 25,
    nextMinCorrect: 75,
    badgeBg: 'bg-[#EBF2EE]',
    badgeText: 'text-[#285242]',
    badgeBorder: 'border-[#B8D1C5]',
    accentColor: '#285242',
    description: 'Mulai konsisten mengenali suku kata dasar tanpa ragu.',
  },
  {
    id: 'master',
    name: 'Master',
    jpTitle: '達人 · Tatsujin',
    minCorrect: 75,
    nextMinCorrect: 150,
    badgeBg: 'bg-[#FDF6EC]',
    badgeText: 'text-[#9A5B13]',
    badgeBorder: 'border-[#E6C99E]',
    accentColor: '#B86F1B',
    description: 'Penguasaan kuat pada deret Gojuuon dan bunyi modifikasi.',
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    jpTitle: '師範 · Shihan',
    minCorrect: 150,
    nextMinCorrect: 275,
    badgeBg: 'bg-[#FBF0E4]',
    badgeText: 'text-[#A64415]',
    badgeBorder: 'border-[#E5B88B]',
    accentColor: '#C85A17',
    description: 'Refleks baca cepat dan tajam pada kosakata N5.',
  },
  {
    id: 'epic',
    name: 'Epic',
    jpTitle: '英傑 · Eiketsu',
    minCorrect: 275,
    nextMinCorrect: 450,
    badgeBg: 'bg-[#E6EFEA]',
    badgeText: 'text-[#1E3A2F]',
    badgeBorder: 'border-[#94B5A5]',
    accentColor: '#1E3A2F',
    description: 'Tahan uji terhadap jebakan visual huruf mirip & Sokuon/Chouon.',
  },
  {
    id: 'legend',
    name: 'Legend',
    jpTitle: '伝説 · Densetsu',
    minCorrect: 450,
    nextMinCorrect: 700,
    badgeBg: 'bg-[#FAECE8]',
    badgeText: 'text-[#8C2D19]',
    badgeBorder: 'border-[#DFADA2]',
    accentColor: '#8C2D19',
    description: 'Penguasaan kalimat Minna no Nihongo Bab 1–5 tanpa Romaji.',
  },
  {
    id: 'mythic',
    name: 'Mythic',
    jpTitle: '神話 · Shinwa',
    minCorrect: 700,
    nextMinCorrect: null,
    badgeBg: 'bg-[#2C2825]',
    badgeText: 'text-[#F5D796]',
    badgeBorder: 'border-[#C89D46]',
    accentColor: '#B8862D',
    description: 'Puncak penguasaan Dojo — Siap tempur ujian resmi JLPT N5 & JFT-Basic.',
  },
];

export function getTotalCorrectAnswers(state: DojoUserState): number {
  const fromItems = Object.values(state.itemStats).reduce(
    (sum, item) => sum + (item.correct || 0),
    0
  );
  const fromDaily = Object.values(state.dailyLogs).reduce(
    (sum, day) => sum + (day.correctCount || 0),
    0
  );
  return Math.max(fromItems, fromDaily);
}

export function getAchievementRank(totalCorrect: number): {
  current: AchievementRankTier;
  next: AchievementRankTier | null;
  progressPercent: number;
  remainingToNext: number;
} {
  let currentIndex = 0;
  for (let i = ACHIEVEMENT_RANKS.length - 1; i >= 0; i--) {
    if (totalCorrect >= ACHIEVEMENT_RANKS[i].minCorrect) {
      currentIndex = i;
      break;
    }
  }

  const current = ACHIEVEMENT_RANKS[currentIndex];
  const next =
    currentIndex < ACHIEVEMENT_RANKS.length - 1
      ? ACHIEVEMENT_RANKS[currentIndex + 1]
      : null;

  if (!next) {
    return {
      current,
      next: null,
      progressPercent: 100,
      remainingToNext: 0,
    };
  }

  const tierSpan = next.minCorrect - current.minCorrect;
  const earnedInTier = Math.max(0, totalCorrect - current.minCorrect);
  const progressPercent = Math.min(
    100,
    Math.round((earnedInTier / Math.max(1, tierSpan)) * 100)
  );
  const remainingToNext = Math.max(0, next.minCorrect - totalCorrect);

  return {
    current,
    next,
    progressPercent,
    remainingToNext,
  };
}

