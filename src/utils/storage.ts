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

  const nextState: DojoUserState = {
    ...prevState,
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
