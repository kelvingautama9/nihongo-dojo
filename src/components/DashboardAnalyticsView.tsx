import React from 'react';
import {
  RotateCcw,
  Volume2,
  Play,
  Trash2,
  Check,
  AlertCircle,
  Flame,
} from 'lucide-react';
import {
  DojoUserState,
  getSenseiLevelMeta,
  getTotalCorrectAnswers,
  getAchievementRank,
  ACHIEVEMENT_RANKS,
} from '../utils/storage';
import { speakJapanese, triggerHaptic } from '../utils/audio';
import { QuestionCategory } from '../data/questionBank';
import { RankEmblem } from './RankEmblem';

interface DashboardAnalyticsViewProps {
  userState: DojoUserState;
  onSelectLevelOverride: (level: number | null) => void;
  onStartMistakeDrill: (mistakeIds: string[]) => void;
  onNavigateTab: (tab: 'drill' | 'study' | 'simulator' | 'dashboard') => void;
  onResetAllData: () => void;
}

export const DashboardAnalyticsView: React.FC<DashboardAnalyticsViewProps> = ({
  userState,
  onSelectLevelOverride,
  onStartMistakeDrill,
  onNavigateTab,
  onResetAllData,
}) => {
  const levelMeta = getSenseiLevelMeta(userState.currentSenseiLevel);
  const mistakes = Object.values(userState.mistakeBank).sort(
    (a, b) => b.missCount - a.missCount
  );

  // Compute Total Correct Answers & Achievement Rank (Warrior -> Mythic)
  const totalCorrectAnswers = getTotalCorrectAnswers(userState);
  const rankInfo = getAchievementRank(totalCorrectAnswers);

  // Build 7-day daily log series (real data from localStorage)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const log = userState.dailyLogs[iso];
    const qCount = log?.questionsAnswered || 0;
    const sessionsCompleted = log?.sessionsCompleted || 0;
    const acc = qCount > 0 ? Math.round((log.correctCount / qCount) * 100) : 0;
    const avgSec = qCount > 0 ? Number((log.totalTimeMs / qCount / 1000).toFixed(1)) : 0;
    const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    const shortDay = d.toLocaleDateString('id-ID', { weekday: 'short' });
    return { iso, label, shortDay, qCount, sessionsCompleted, acc, avgSec };
  });

  // Compute concise streak motivation
  const streakCount = userState.streakDays;
  const getStreakMotivation = (days: number): { title: string; message: string; isHigh: boolean } => {
    if (days >= 7) {
      return {
        title: 'Disiplin Tinggi',
        message: `${days} hari latihan tanpa putus. Pertahankan ritme menuju kelulusan N5.`,
        isHigh: true,
      };
    }
    if (days >= 3) {
      return {
        title: 'Momentum Aktif',
        message: `${days} hari beruntun aktif. Jaga konsistensi hingga 7 hari penuh.`,
        isHigh: true,
      };
    }
    if (days >= 1) {
      return {
        title: 'Streak Menyala',
        message: `Aktif ${days} hari. Selesaikan 1 sesi besok agar streak tetap terjaga.`,
        isHigh: false,
      };
    }
    return {
      title: 'Belum Aktif Hari Ini',
      message: 'Kerjakan 1 sesi latihan atau tes hari ini untuk menyalakan streak.',
      isHigh: false,
    };
  };

  const streakInfo = getStreakMotivation(streakCount);

  // Compute Category Mastery from userState.itemStats
  const categoryMastery = (
    [
      { id: 'hiragana', label: 'Hiragana Dasar' },
      { id: 'katakana', label: 'Katakana & Gairaigo' },
      { id: 'modifikasi', label: 'Modifikasi Bunyi' },
      { id: 'kalimat', label: 'Kalimat & Kosakata MNN' },
    ] as Array<{ id: QuestionCategory; label: string }>
  ).map((cat) => {
    const items = Object.values(userState.itemStats).filter((s) => s.category === cat.id);
    const totalAttempts = items.reduce((acc, s) => acc + s.attempts, 0);
    const totalCorrect = items.reduce((acc, s) => acc + s.correct, 0);
    const totalTimeMs = items.reduce((acc, s) => acc + s.totalTimeMs, 0);
    const accuracy =
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;
    const avgSec =
      totalAttempts > 0 ? (totalTimeMs / totalAttempts / 1000).toFixed(1) : null;

    return {
      ...cat,
      totalAttempts,
      totalCorrect,
      accuracy,
      avgSec,
    };
  });

  const maxDailyQuestions = Math.max(20, ...last7Days.map((d) => d.qCount));

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Minimalist Top Header */}
      <div className="pb-2.5 border-b border-[#E2DCD0] flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#5C554E] truncate">
            <span>Dasbor Analitik</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">{totalCorrectAnswers} Benar</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">{userState.totalXp} XP</span>
          </div>
          <h1 className="text-sm sm:text-base font-semibold text-[#2C2825] tracking-tight truncate">
            Profil, Rank & Evaluasi Progres
          </h1>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {mistakes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('select');
                onStartMistakeDrill(mistakes.map((m) => m.questionId));
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#8C2D19] hover:bg-[#722312] text-[#FBF9F5] text-[11px] font-semibold transition-colors cursor-pointer active:scale-[0.98]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Uji Salah ({mistakes.length})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('select');
              onNavigateTab('simulator');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1E3A2F] hover:bg-[#152A22] text-[#FBF9F5] text-[11px] font-semibold transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Play className="w-3 h-3" />
            <span>Tes CBT</span>
          </button>
        </div>
      </div>

      {/* Profil Pengguna & Achievement Rank Card (Warrior -> Epic -> Legend -> Mythic) */}
      <div className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* User Profile & Active Rank Emblem */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${rankInfo.current.badgeBg} ${rankInfo.current.badgeBorder} ${rankInfo.current.badgeText}`}
              title={`Rank Aktif: ${rankInfo.current.name}`}
            >
              <RankEmblem rankId={rankInfo.current.id} size="md" />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#5C554E]">
                  Profil Kenshuusei
                </span>
                <span aria-hidden="true" className="text-[#D5CBB8]">·</span>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${rankInfo.current.badgeBg} ${rankInfo.current.badgeBorder} ${rankInfo.current.badgeText}`}
                >
                  <RankEmblem rankId={rankInfo.current.id} size="xs" />
                  <span>{rankInfo.current.name}</span>
                </span>
                <span className="text-[10px] font-jp text-[#5C554E]">
                  ({rankInfo.current.jpTitle})
                </span>
              </div>

              <div className="text-xs sm:text-sm font-bold text-[#2C2825] truncate">
                Rank {rankInfo.current.name} ·{' '}
                <span className="font-mono-num text-[#1E3A2F]">
                  {totalCorrectAnswers} Soal Benar
                </span>
              </div>

              <p className="text-[11px] text-[#5C554E] leading-snug">
                {rankInfo.current.description}
              </p>
            </div>
          </div>

          {/* Next Rank Progress Mini Summary */}
          <div className="sm:w-52 shrink-0 space-y-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2DCD0]">
            <div className="flex items-center justify-between text-[10px] font-mono-num text-[#5C554E]">
              <span>
                {rankInfo.next
                  ? `Menuju ${rankInfo.next.name}`
                  : 'Rank Tertinggi Tercapai'}
              </span>
              <span className="font-semibold text-[#2C2825]">
                {rankInfo.next
                  ? `${totalCorrectAnswers}/${rankInfo.next.minCorrect}`
                  : `${totalCorrectAnswers} Benar`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#F4EFE6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1E3A2F] transition-all"
                style={{ width: `${rankInfo.progressPercent}%` }}
              />
            </div>
            {rankInfo.next && (
              <div className="text-[10px] text-[#857D74] text-right font-mono-num">
                Kurang {rankInfo.remainingToNext} soal benar lagi
              </div>
            )}
          </div>
        </div>

        {/* All 7 Achievement Badges Track (Warrior, Elite, Master, Grandmaster, Epic, Legend, Mythic) */}
        <div className="pt-2.5 border-t border-[#E2DCD0]">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {ACHIEVEMENT_RANKS.map((tier) => {
              const isUnlocked = totalCorrectAnswers >= tier.minCorrect;
              const isCurrent = rankInfo.current.id === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`px-2 py-1.5 rounded-lg border flex flex-col items-center text-center transition-colors ${
                    isCurrent
                      ? `${tier.badgeBg} ${tier.badgeBorder} ${tier.badgeText}`
                      : isUnlocked
                      ? 'bg-[#FBF9F5] border-[#D5CBB8] text-[#2C2825]'
                      : 'bg-[#F4EFE6]/50 border-[#E2DCD0] text-[#857D74] opacity-60'
                  }`}
                  title={`${tier.name} (Minimal ${tier.minCorrect} soal benar)`}
                >
                  <div className="flex items-center gap-1">
                    <RankEmblem rankId={tier.id} size="xs" />
                    <span className="text-[10px] font-semibold truncate">
                      {tier.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono-num opacity-80">
                    {tier.minCorrect}+ benar
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compact Grid: Daily Streak + Tahapan Level Sensei */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Daily Streak Card (5 cols) */}
        <div
          className={`lg:col-span-5 rounded-xl border p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 ${
            streakInfo.isHigh
              ? 'bg-[#FDF6EC] border-[#DFC298]'
              : 'bg-[#FFFFFF] border-[#E2DCD0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                streakCount > 0
                  ? 'bg-[#FCE8D5] border-[#E5B88B] text-[#C85A17]'
                  : 'bg-[#F4EFE6] border-[#E2DCD0] text-[#857D74]'
              }`}
            >
              <Flame className="w-4 h-4 fill-current" />
            </div>

            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono-num text-sm sm:text-base font-bold text-[#2C2825]">
                  {streakCount} Hari Streak
                </span>
                <span className="text-[10px] font-semibold text-[#C85A17] truncate">
                  · {streakInfo.title}
                </span>
              </div>
              <p className="text-[11px] text-[#5C554E] leading-snug">
                {streakInfo.message}
              </p>
            </div>
          </div>

          {/* Compact 7-Day Visual Streak Chain */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#E2DCD0]">
            {last7Days.map((d) => {
              const isActiveDay = d.qCount > 0 || d.sessionsCompleted > 0;
              return (
                <div
                  key={d.iso}
                  className="flex flex-col items-center gap-0.5"
                  title={`${d.label}: ${d.qCount} soal`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center border text-[10px] ${
                      isActiveDay
                        ? 'bg-[#C85A17] border-[#C85A17] text-[#FBF9F5]'
                        : 'bg-[#F4EFE6] border-[#E2DCD0] text-[#857D74]'
                    }`}
                  >
                    {isActiveDay ? (
                      <Flame className="w-3 h-3 fill-current" />
                    ) : (
                      <span className="font-mono-num text-[9px]">·</span>
                    )}
                  </div>
                  <span className="text-[9px] text-[#5C554E]">{d.shortDay}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Sensei Level Progression & Compact Switcher (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-[#5C554E]">
              <span className="font-mono-num font-semibold text-[#1E3A2F]">
                {levelMeta.badge} AKTIF · {levelMeta.romajiPolicy}
              </span>
              <span className="text-[10px] text-[#857D74]">*Lv.4–5 Tanpa Romaji</span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-[#2C2825] leading-snug">
              {levelMeta.title}
            </h2>
            <p className="text-[11px] text-[#5C554E] leading-snug">
              {levelMeta.subtitle}
            </p>
          </div>

          {/* Single-row Compact Level Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('select');
                onSelectLevelOverride(null);
              }}
              className={`px-2 py-1 rounded text-[11px] font-medium border shrink-0 cursor-pointer active:scale-[0.98] ${
                userState.manualLevelOverride === null
                  ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                  : 'bg-[#FBF9F5] text-[#5C554E] border-[#D5CBB8]'
              }`}
            >
              Auto (XP)
            </button>
            {[1, 2, 3, 4, 5].map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => {
                  triggerHaptic('select');
                  onSelectLevelOverride(lv);
                }}
                className={`px-2 py-1 rounded font-mono-num text-[11px] font-medium border shrink-0 cursor-pointer active:scale-[0.98] ${
                  userState.currentSenseiLevel === lv && userState.manualLevelOverride === lv
                    ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                    : 'bg-[#FBF9F5] text-[#2C2825] border-[#D5CBB8] hover:bg-[#F4EFE6]'
                }`}
              >
                Lv.{lv}{lv >= 4 ? '*' : ''}
              </button>
            ))}
          </div>

          {/* XP Progress Bar — Concise Labels so they never collide on mobile */}
          <div className="space-y-1 pt-1.5 border-t border-[#E2DCD0]">
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono-num text-[#5C554E]">
              <span>Progres: {userState.totalXp} XP</span>
              <span>Target Lv Berikutnya: {levelMeta.nextTargetXp} XP</span>
            </div>
            <div className="w-full h-1.5 bg-[#F4EFE6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1E3A2F] transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((userState.totalXp / levelMeta.nextTargetXp) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Daily Progress Chart & 4-Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Daily Progress Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-3 sm:p-4 flex flex-col justify-between space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-[#2C2825]">
                Tren Latihan 7 Hari Terakhir
              </h2>
              <p className="text-[11px] text-[#5C554E]">
                Jumlah soal & akurasi harian real-time.
              </p>
            </div>
            <span className="text-[10px] font-mono-num text-[#5C554E] shrink-0">
              Hari ini: {last7Days[6].qCount} soal ({last7Days[6].acc}%)
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-2 items-end h-32 sm:h-36 border-b border-[#E2DCD0] pb-2">
            {last7Days.map((day) => {
              const barHeightPct =
                day.qCount > 0
                  ? Math.max(14, Math.round((day.qCount / maxDailyQuestions) * 100))
                  : 4;

              return (
                <div
                  key={day.iso}
                  className="flex flex-col items-center justify-end h-full gap-1"
                >
                  <div className="text-[9px] font-mono-num text-[#5C554E] text-center">
                    {day.qCount > 0 ? `${day.acc}%` : '—'}
                  </div>
                  <div className="w-full max-w-[28px] bg-[#F4EFE6] rounded-t h-20 sm:h-24 flex items-end overflow-hidden border border-[#E2DCD0]">
                    <div
                      className={`w-full transition-all ${
                        day.qCount === 0
                          ? 'bg-[#E2DCD0]'
                          : day.acc >= 85
                          ? 'bg-[#1E3A2F]'
                          : day.acc >= 75
                          ? 'bg-[#D9822B]'
                          : 'bg-[#8C2D19]'
                      }`}
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono-num text-[#2C2825] font-medium">
                    {day.qCount}
                  </div>
                  <div className="text-[9px] text-[#857D74] truncate max-w-full">
                    {day.shortDay}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-[#5C554E]">
            Target harian: &ge; 50 soal dengan akurasi &ge; 85%
          </div>
        </div>

        {/* Category Accuracy & Response Time Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-[#F4EFE6] border border-[#E2DCD0] rounded-xl p-3 sm:p-4 space-y-2.5">
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-[#2C2825]">
              Penguasaan 4 Pilar Kurikulum
            </h2>
            <p className="text-[11px] text-[#5C554E]">
              Akurasi dan kecepatan respons per materi.
            </p>
          </div>

          <div className="space-y-2">
            {categoryMastery.map((cat) => (
              <div
                key={cat.id}
                className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E2DCD0] space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2C2825] truncate">{cat.label}</span>
                  <span className="font-mono-num font-bold text-[#1E3A2F] shrink-0">
                    {cat.accuracy !== null ? `${cat.accuracy}%` : '—'}
                  </span>
                </div>

                <div className="w-full h-1 bg-[#F4EFE6] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      (cat.accuracy ?? 0) >= 85
                        ? 'bg-[#1E3A2F]'
                        : (cat.accuracy ?? 0) >= 75
                        ? 'bg-[#D9822B]'
                        : 'bg-[#8C2D19]'
                    }`}
                    style={{ width: `${cat.accuracy ?? 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono-num text-[#857D74]">
                  <span>
                    {cat.totalCorrect}/{cat.totalAttempts} benar
                  </span>
                  <span>{cat.avgSec ? `${cat.avgSec}d/soal` : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Mistake Bank (Bank Kesalahan Spesifik Pengguna) */}
      <div className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E2DCD0]">
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-[#2C2825] truncate">
              Bank Kesalahan ({mistakes.length})
            </h2>
            <p className="text-[11px] text-[#5C554E] truncate">
              Otomatis terhapus saat berhasil dijawab benar.
            </p>
          </div>

          {mistakes.length > 0 && (
            <button
              type="button"
              onClick={() => onStartMistakeDrill(mistakes.map((m) => m.questionId))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8C2D19] hover:bg-[#722312] text-[#FBF9F5] text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Latih ({mistakes.length})</span>
            </button>
          )}
        </div>

        {mistakes.length === 0 ? (
          <div className="p-3 rounded-lg bg-[#FBF9F5] border border-[#E2DCD0] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Check className="w-4 h-4 text-[#1E3A2F] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#2C2825]">
                  Bank Kesalahan Bersih (0 Kelemahan)
                </div>
                <p className="text-[11px] text-[#5C554E] truncate">
                  Semua soal yang pernah salah telah dikuasai.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('drill')}
              className="px-2.5 py-1 rounded-md bg-[#1E3A2F] text-[#FBF9F5] text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Latihan Deret
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Compact Card List (md:hidden) */}
            <div className="md:hidden divide-y divide-[#E2DCD0] border border-[#E2DCD0] rounded-lg bg-[#FBF9F5] overflow-hidden">
              {mistakes.map((m) => (
                <div key={m.questionId} className="p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-num">
                      <span className="uppercase font-semibold text-[#5C554E]">
                        {m.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-0.5 text-[#8C2D19] font-semibold">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>{m.missCount}x salah</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakJapanese(m.stimulus, 0.85)}
                      className="p-1 rounded bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#D5CBB8] shrink-0 cursor-pointer"
                      title="Dengarkan"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="font-jp text-xs sm:text-sm font-bold text-[#2C2825] leading-relaxed break-words">
                    {m.stimulus}
                  </div>

                  <div className="flex flex-wrap items-baseline gap-1 text-[11px]">
                    <span className="text-[#5C554E]">Kunci:</span>
                    <span className="font-jp font-semibold text-[#1E3A2F]">
                      {m.correctAnswer}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#5C554E] leading-relaxed">
                    {m.explanation}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto border border-[#E2DCD0] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4EFE6] text-[#5C554E] border-b border-[#E2DCD0]">
                    <th className="py-2 px-3 font-semibold w-1/4">Huruf / Kalimat</th>
                    <th className="py-2 px-3 font-semibold">Jawaban Tepat</th>
                    <th className="py-2 px-3 font-semibold">Kategori</th>
                    <th className="py-2 px-3 font-semibold">Frekuensi</th>
                    <th className="py-2 px-3 font-semibold">Catatan Perbaikan</th>
                    <th className="py-2 px-3 font-semibold text-right">Suara</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DCD0]">
                  {mistakes.map((m) => (
                    <tr key={m.questionId} className="hover:bg-[#FBF9F5]">
                      <td className="py-2.5 px-3 font-jp text-xs font-bold text-[#2C2825] max-w-xs leading-relaxed">
                        {m.stimulus}
                      </td>
                      <td className="py-2.5 px-3 font-jp font-semibold text-[#1E3A2F]">
                        {m.correctAnswer}
                      </td>
                      <td className="py-2.5 px-3 uppercase font-mono-num text-[11px] text-[#5C554E]">
                        {m.category}
                      </td>
                      <td className="py-2.5 px-3 font-mono-num text-[11px] text-[#8C2D19] font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{m.missCount}x salah</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#5C554E] max-w-md leading-relaxed">
                        {m.explanation}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => speakJapanese(m.stimulus, 0.85)}
                          className="p-1 rounded bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#D5CBB8] cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Section 4: Recent Test History & Data Reset */}
      <div className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-3 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E2DCD0]">
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-[#2C2825]">
              Riwayat Sesi Ujian CBT
            </h2>
            <p className="text-[10px] sm:text-[11px] text-[#5C554E]">
              Rekaman skor ujian terakhir di perangkat Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetAllData}
            className="flex items-center gap-1 px-2 py-1 rounded border border-[#E2DCD0] text-[10px] sm:text-[11px] text-[#8C2D19] hover:bg-[#FBECE9] transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Reset Data</span>
          </button>
        </div>

        {userState.testHistory.length === 0 ? (
          <div className="text-[11px] text-[#5C554E] py-2">
            Belum ada riwayat ujian penuh yang diselesaikan. Buka tab <strong>Ujian CBT</strong> untuk mengambil tes 15, 50, atau 100 soal.
          </div>
        ) : (
          <>
            {/* Mobile Compact History List (md:hidden) */}
            <div className="md:hidden divide-y divide-[#E2DCD0] border border-[#E2DCD0] rounded-lg bg-[#FBF9F5] overflow-hidden">
              {userState.testHistory.map((rec) => (
                <div key={rec.id} className="p-2.5 space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#2C2825]">{rec.levelLabel}</span>
                    <span className="font-mono-num font-bold text-[#1E3A2F]">
                      {rec.scorePercent}% · Grade {rec.grade}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#5C554E] font-mono-num">
                    <span>
                      {rec.modeLabel} ({rec.correctCount}/{rec.totalQuestions})
                    </span>
                    <span>
                      {rec.avgTimeSec}d/soal ·{' '}
                      {new Date(rec.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop History Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto border border-[#E2DCD0] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4EFE6] text-[#5C554E] border-b border-[#E2DCD0]">
                    <th className="py-2 px-3 font-semibold">Waktu Selesai</th>
                    <th className="py-2 px-3 font-semibold">Level & Materi</th>
                    <th className="py-2 px-3 font-semibold">Mode</th>
                    <th className="py-2 px-3 font-semibold">Skor Akhir</th>
                    <th className="py-2 px-3 font-semibold">Grade</th>
                    <th className="py-2 px-3 font-semibold">Kecepatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DCD0] font-mono-num text-[11px]">
                  {userState.testHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FBF9F5]">
                      <td className="py-2 px-3 text-[#5C554E]">
                        {new Date(rec.timestamp).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2 px-3 font-sans font-medium text-[#2C2825]">
                        {rec.levelLabel}
                      </td>
                      <td className="py-2 px-3 font-sans text-[#5C554E]">{rec.modeLabel}</td>
                      <td className="py-2 px-3 font-bold text-[#2C2825]">
                        {rec.scorePercent}% ({rec.correctCount}/{rec.totalQuestions})
                      </td>
                      <td className="py-2 px-3 font-bold text-[#1E3A2F]">Grade {rec.grade}</td>
                      <td className="py-2 px-3 text-[#5C554E]">{rec.avgTimeSec}d / soal</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
