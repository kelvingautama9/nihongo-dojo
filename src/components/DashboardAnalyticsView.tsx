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
} from '../utils/storage';
import { speakJapanese, triggerHaptic } from '../utils/audio';
import { QuestionCategory } from '../data/questionBank';

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

  // Compute consecutive test/study streak message
  const streakCount = userState.streakDays;
  const getStreakMotivation = (days: number): { title: string; message: string; isHigh: boolean } => {
    if (days >= 7) {
      return {
        title: 'Kecepatan & Disiplin Luar Biasa! (High Streak)',
        message: `Anda telah berlatih dan menyelesaikan sesi tanpa putus selama ${days} hari berturut-turut! Konsistensi ini adalah kunci utama lulus JLPT N5 / JFT-Basic tepat waktu.`,
        isHigh: true,
      };
    }
    if (days >= 3) {
      return {
        title: 'Momentum Belajar Sedang Menyala!',
        message: `${days} hari beruntun aktif! Pertahankan hingga 7 hari penuh agar memori Hiragana, Katakana, dan kosakata MNN terkunci permanen di Long-Term Memory.`,
        isHigh: true,
      };
    }
    if (days >= 1) {
      return {
        title: 'Langkah Awal yang Baik Hari Ini',
        message: `Streak ${days} hari aktif. Selesaikan minimal 1 sesi tes besok untuk menjaga api konsistensi Anda tetap menyala.`,
        isHigh: false,
      };
    }
    return {
      title: 'Mulai Daily Streak Anda Hari Ini',
      message: 'Belum ada sesi latihan/tes yang diselesaikan hari ini. Kerjakan 1 sesi tes untuk menyalakan kembali api Daily Streak Anda!',
      isHigh: false,
    };
  };

  const streakInfo = getStreakMotivation(streakCount);

  // Compute Category Mastery from userState.itemStats
  const categoryMastery = (
    [
      { id: 'hiragana', label: 'Hiragana Dasar (Gojuuon)' },
      { id: 'katakana', label: 'Katakana Dasar & Gairaigo' },
      { id: 'modifikasi', label: 'Modifikasi (Sokuon / Chouon / Youon)' },
      { id: 'kalimat', label: 'Kalimat Kontekstual & Kosakata MNN' },
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
    <div className="space-y-4 sm:space-y-5">
      {/* Compact Header */}
      <div className="pb-3 border-b border-[#E2DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#5C554E] truncate">
            <span>Menu D · Dasbor Analitik</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">XP: {userState.totalXp}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">Streak: {userState.streakDays} Hari</span>
          </div>
          <h1 className="text-base sm:text-xl font-semibold text-[#2C2825] tracking-tight">
            Progres Harian, Level & Bank Kesalahan
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {mistakes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('select');
                onStartMistakeDrill(mistakes.map((m) => m.questionId));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8C2D19] hover:bg-[#722312] text-[#FBF9F5] text-xs font-semibold transition-colors cursor-pointer active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Uji Ulang ({mistakes.length})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('select');
              onNavigateTab('simulator');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A2F] hover:bg-[#152A22] text-[#FBF9F5] text-xs font-semibold transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulasi CBT</span>
          </button>
        </div>
      </div>

      {/* Daily Streak Counter Card with Fire Icon & Motivational Message */}
      <div
        className={`rounded-xl border p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          streakInfo.isHigh
            ? 'bg-[#FDF6EC] border-[#DFC298]'
            : 'bg-[#FFFFFF] border-[#E2DCD0]'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              streakCount > 0
                ? 'bg-[#FCE8D5] border-[#E5B88B] text-[#C85A17]'
                : 'bg-[#F4EFE6] border-[#E2DCD0] text-[#857D74]'
            }`}
          >
            <Flame className="w-6 h-6 fill-current" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-num text-xl sm:text-2xl font-bold text-[#2C2825]">
                {streakCount} Hari Beruntun
              </span>
              <span className="text-xs font-semibold text-[#C85A17]">
                {streakInfo.title}
              </span>
            </div>
            <p className="text-xs text-[#5C554E] leading-relaxed max-w-2xl">
              {streakInfo.message}
            </p>
          </div>
        </div>

        {/* 7-Day Visual Streak Chain */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E2DCD0] shrink-0">
          {last7Days.map((d) => {
            const isActiveDay = d.qCount > 0 || d.sessionsCompleted > 0;
            return (
              <div
                key={d.iso}
                className="flex flex-col items-center gap-1"
                title={`${d.label}: ${d.qCount} soal (${d.sessionsCompleted} sesi selesai)`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs transition-colors ${
                    isActiveDay
                      ? 'bg-[#C85A17] border-[#C85A17] text-[#FBF9F5]'
                      : 'bg-[#F4EFE6] border-[#E2DCD0] text-[#857D74]'
                  }`}
                >
                  {isActiveDay ? (
                    <Flame className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <span className="font-mono-num text-[10px]">·</span>
                  )}
                </div>
                <span className="text-[10px] text-[#5C554E]">{d.shortDay}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 1: Real-time Sensei Level Progression & Adaptive Romaji Switcher */}
      <div className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs text-[#5C554E]">
              <span className="font-mono-num font-semibold text-[#1E3A2F]">
                {levelMeta.badge} AKTIF
              </span>
              <span aria-hidden="true">·</span>
              <span>{levelMeta.romajiPolicy}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#2C2825]">{levelMeta.title}</h2>
            <p className="text-xs text-[#5C554E]">{levelMeta.subtitle}</p>
          </div>

          {/* Level Stepper / Simulator Override */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-[#857D74]">
              Pilih Tahapan Level (atau Biarkan Otomatis sesuai XP):
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('select');
                  onSelectLevelOverride(null);
                }}
                className={`px-2.5 py-1.5 rounded text-xs font-medium border cursor-pointer active:scale-[0.98] ${
                  userState.manualLevelOverride === null
                    ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                    : 'bg-[#FBF9F5] text-[#5C554E] border-[#D5CBB8]'
                }`}
              >
                Otomatis (XP)
              </button>
              {[1, 2, 3, 4, 5].map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => {
                    triggerHaptic('select');
                    onSelectLevelOverride(lv);
                  }}
                  className={`px-2.5 py-1.5 rounded font-mono-num text-xs font-medium border cursor-pointer active:scale-[0.98] ${
                    userState.currentSenseiLevel === lv && userState.manualLevelOverride === lv
                      ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                      : 'bg-[#FBF9F5] text-[#2C2825] border-[#D5CBB8] hover:bg-[#F4EFE6]'
                  }`}
                >
                  Lv.{lv} {lv >= 4 ? '(Tanpa Romaji)' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1 pt-2 border-t border-[#E2DCD0]">
          <div className="flex justify-between text-xs font-mono-num text-[#5C554E]">
            <span>Progres Penguasaan: {userState.totalXp} XP</span>
            <span>Target Level Berikutnya: {levelMeta.nextTargetXp} XP</span>
          </div>
          <div className="w-full h-2 bg-[#F4EFE6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1E3A2F] transition-all"
              style={{
                width: `${Math.min(100, Math.round((userState.totalXp / levelMeta.nextTargetXp) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Daily Progress Chart & 4-Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Progress Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[#2C2825]">
              Berapa jumlah soal dan akurasi latihan Anda dalam 7 hari terakhir?
            </h2>
            <p className="text-xs text-[#5C554E] mt-0.5">
              Tercatat secara real-time setiap kali Anda menjawab soal di Latihan Deret maupun Simulator CBT.
            </p>
          </div>

          <div className="grid grid-cols-7 gap-2.5 pt-4 items-end h-48 border-b border-[#E2DCD0] pb-3">
            {last7Days.map((day) => {
              const barHeightPct =
                day.qCount > 0 ? Math.max(14, Math.round((day.qCount / maxDailyQuestions) * 100)) : 4;

              return (
                <div
                  key={day.iso}
                  className="flex flex-col items-center justify-end h-full gap-1.5"
                >
                  <div className="text-[10px] font-mono-num text-[#5C554E] text-center">
                    {day.qCount > 0 ? `${day.acc}%` : '—'}
                  </div>
                  <div className="w-full max-w-[38px] bg-[#F4EFE6] rounded-t-md h-32 flex items-end overflow-hidden border border-[#E2DCD0]">
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
                  <div className="text-[11px] font-mono-num text-[#2C2825] font-medium">
                    {day.qCount} soal
                  </div>
                  <div className="text-[10px] text-[#857D74] truncate max-w-full">
                    {day.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C554E]">
            <span>Target Sensei: Minimal 50 soal/hari dengan akurasi &ge; 85%</span>
            <span className="font-mono-num">
              Hari Ini: {last7Days[6].qCount} soal · Akurasi {last7Days[6].acc}%
            </span>
          </div>
        </div>

        {/* Category Accuracy & Response Time Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-[#F4EFE6] border border-[#E2DCD0] rounded-xl p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[#2C2825]">
              Peta Penguasaan 4 Pilar Kurikulum
            </h2>
            <p className="text-xs text-[#5C554E] mt-0.5">
              Akurasi dan rata-rata waktu respons per kategori materi.
            </p>
          </div>

          <div className="space-y-3">
            {categoryMastery.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E2DCD0] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2C2825]">{cat.label}</span>
                  <span className="font-mono-num font-bold text-[#1E3A2F]">
                    {cat.accuracy !== null ? `${cat.accuracy}%` : 'Belum diuji'}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-[#F4EFE6] rounded-full overflow-hidden">
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

                <div className="flex items-center justify-between text-[11px] font-mono-num text-[#857D74]">
                  <span>
                    Dijawab: {cat.totalCorrect}/{cat.totalAttempts} benar
                  </span>
                  <span>
                    Kecepatan: {cat.avgSec ? `${cat.avgSec}d/soal` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Mistake Bank (Bank Kesalahan Spesifik Pengguna) */}
      <div className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DCD0]">
          <div>
            <h2 className="text-base font-semibold text-[#2C2825]">
              Bank Kesalahan (Mistake Bank) — Huruf & Kalimat yang Sering Tertukar
            </h2>
            <p className="text-xs text-[#5C554E] mt-0.5">
              Setiap soal yang salah otomatis masuk ke daftar ini dan akan hilang setelah Anda menjawabnya dengan benar.
            </p>
          </div>

          {mistakes.length > 0 && (
            <button
              type="button"
              onClick={() => onStartMistakeDrill(mistakes.map((m) => m.questionId))}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8C2D19] hover:bg-[#722312] text-[#FBF9F5] text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Latih Semua Kesalahan Sekarang ({mistakes.length})</span>
            </button>
          )}
        </div>

        {mistakes.length === 0 ? (
          <div className="p-5 rounded-lg bg-[#FBF9F5] border border-[#E2DCD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#1E3A2F] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-[#2C2825]">
                  Bank Kesalahan Bersih (0 Kelemahan Aktif)
                </div>
                <p className="text-xs text-[#5C554E] mt-0.5">
                  Belum ada soal yang tertukar, atau seluruh soal yang pernah salah telah berhasil Anda perbaiki.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('drill')}
              className="px-4 py-2 rounded-lg bg-[#1E3A2F] text-[#FBF9F5] text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              Mulai Latihan Deret
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Compact Card List (md:hidden) — Zero Horizontal Clipping */}
            <div className="md:hidden divide-y divide-[#E2DCD0] border border-[#E2DCD0] rounded-lg bg-[#FBF9F5] overflow-hidden">
              {mistakes.map((m) => (
                <div key={m.questionId} className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono-num">
                      <span className="uppercase font-semibold text-[#5C554E]">
                        {m.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-[#8C2D19] font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        <span>{m.missCount}x salah</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakJapanese(m.stimulus, 0.85)}
                      className="p-1.5 rounded bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#D5CBB8] shrink-0 cursor-pointer"
                      title="Dengarkan"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="font-jp text-sm font-bold text-[#2C2825] leading-relaxed break-words">
                    {m.stimulus}
                  </div>

                  <div className="flex flex-wrap items-baseline gap-1.5 text-xs">
                    <span className="text-[#5C554E]">Kunci Tepat:</span>
                    <span className="font-jp font-semibold text-[#1E3A2F]">
                      {m.correctAnswer}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5C554E] leading-relaxed">
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
                    <th className="py-2.5 px-3.5 font-semibold w-1/4">Huruf / Kalimat</th>
                    <th className="py-2.5 px-3.5 font-semibold">Jawaban Tepat</th>
                    <th className="py-2.5 px-3.5 font-semibold">Kategori</th>
                    <th className="py-2.5 px-3.5 font-semibold">Frekuensi</th>
                    <th className="py-2.5 px-3.5 font-semibold">Catatan Perbaikan</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Suara</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DCD0]">
                  {mistakes.map((m) => (
                    <tr key={m.questionId} className="hover:bg-[#FBF9F5]">
                      <td className="py-3 px-3.5 font-jp text-sm font-bold text-[#2C2825] max-w-xs leading-relaxed">
                        {m.stimulus}
                      </td>
                      <td className="py-3 px-3.5 font-jp font-semibold text-[#1E3A2F]">
                        {m.correctAnswer}
                      </td>
                      <td className="py-3 px-3.5 uppercase font-mono-num text-[#5C554E]">
                        {m.category}
                      </td>
                      <td className="py-3 px-3.5 font-mono-num text-[#8C2D19] font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{m.missCount}x salah</span>
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-[#5C554E] max-w-md leading-relaxed">
                        {m.explanation}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => speakJapanese(m.stimulus, 0.85)}
                          className="p-1.5 rounded bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#D5CBB8] cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
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
      <div className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-4 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E2DCD0]">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-[#2C2825]">
              Riwayat Sesi Ujian Simulator CBT
            </h2>
            <p className="text-[11px] sm:text-xs text-[#5C554E] mt-0.5">
              Rekaman skor ujian terakhir di memori lokal perangkat Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetAllData}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[#E2DCD0] text-[11px] sm:text-xs text-[#8C2D19] hover:bg-[#FBECE9] transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>

        {userState.testHistory.length === 0 ? (
          <div className="text-xs text-[#5C554E] py-3">
            Belum ada riwayat simulasi ujian penuh yang diselesaikan. Buka tab <strong>Ujian CBT</strong> untuk mengambil tes 15, 50, atau 100 soal.
          </div>
        ) : (
          <>
            {/* Mobile Compact History List (md:hidden) */}
            <div className="md:hidden divide-y divide-[#E2DCD0] border border-[#E2DCD0] rounded-lg bg-[#FBF9F5] overflow-hidden">
              {userState.testHistory.map((rec) => (
                <div key={rec.id} className="p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2C2825]">{rec.levelLabel}</span>
                    <span className="font-mono-num font-bold text-[#1E3A2F]">
                      {rec.scorePercent}% · Grade {rec.grade}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#5C554E] font-mono-num">
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
                    <th className="py-2.5 px-3.5 font-semibold">Waktu Selesai</th>
                    <th className="py-2.5 px-3.5 font-semibold">Level & Materi</th>
                    <th className="py-2.5 px-3.5 font-semibold">Mode</th>
                    <th className="py-2.5 px-3.5 font-semibold">Skor Akhir</th>
                    <th className="py-2.5 px-3.5 font-semibold">Grade</th>
                    <th className="py-2.5 px-3.5 font-semibold">Kecepatan Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DCD0] font-mono-num">
                  {userState.testHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FBF9F5]">
                      <td className="py-2.5 px-3.5 text-[#5C554E]">
                        {new Date(rec.timestamp).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3.5 font-sans font-medium text-[#2C2825]">
                        {rec.levelLabel}
                      </td>
                      <td className="py-2.5 px-3.5 font-sans text-[#5C554E]">{rec.modeLabel}</td>
                      <td className="py-2.5 px-3.5 font-bold text-[#2C2825]">
                        {rec.scorePercent}% ({rec.correctCount}/{rec.totalQuestions})
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-[#1E3A2F]">Grade {rec.grade}</td>
                      <td className="py-2.5 px-3.5 text-[#5C554E]">{rec.avgTimeSec}d / soal</td>
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
