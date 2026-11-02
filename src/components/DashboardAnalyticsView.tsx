import React from 'react';
import {
  RotateCcw,
  Volume2,
  Play,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  DojoUserState,
  getSenseiLevelMeta,
} from '../utils/storage';
import { speakJapanese } from '../utils/audio';
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
    const acc = qCount > 0 ? Math.round((log.correctCount / qCount) * 100) : 0;
    const avgSec = qCount > 0 ? Number((log.totalTimeMs / qCount / 1000).toFixed(1)) : 0;
    const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    return { iso, label, qCount, acc, avgSec };
  });

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
              onClick={() => onStartMistakeDrill(mistakes.map((m) => m.questionId))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8C2D19] hover:bg-[#722312] text-[#FBF9F5] text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Uji Ulang ({mistakes.length})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigateTab('simulator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A2F] hover:bg-[#152A22] text-[#FBF9F5] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulasi CBT</span>
          </button>
        </div>
      </div>

      {/* Section 1: Real-time Sensei Level Progression & Adaptive Romaji Switcher */}
      <div className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#5C554E]">
              <span className="font-mono-num font-semibold text-[#1E3A2F]">
                {levelMeta.badge} AKTIF
              </span>
              <span aria-hidden="true">·</span>
              <span>{levelMeta.romajiPolicy}</span>
            </div>
            <h2 className="text-lg font-bold text-[#2C2825]">{levelMeta.title}</h2>
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
                onClick={() => onSelectLevelOverride(null)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium border cursor-pointer ${
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
                  onClick={() => onSelectLevelOverride(lv)}
                  className={`px-2.5 py-1.5 rounded font-mono-num text-xs font-medium border cursor-pointer ${
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
          <div className="p-6 rounded-lg bg-[#FBF9F5] border border-[#E2DCD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#1E3A2F] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-[#2C2825]">
                  Bank Kesalahan Bersih (0 Kelemahan Aktif)
                </div>
                <p className="text-xs text-[#5C554E] mt-0.5">
                  Belum ada soal yang tertukar, atau seluruh soal yang pernah salah telah berhasil Anda perbaiki. Mulai sesi latihan atau simulasi ujian untuk menguji ketajaman hafalan Anda.
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
          <div className="overflow-x-auto border border-[#E2DCD0] rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4EFE6] text-[#5C554E] border-b border-[#E2DCD0]">
                  <th className="py-2.5 px-3.5 font-semibold">Huruf / Kalimat</th>
                  <th className="py-2.5 px-3.5 font-semibold">Jawaban Tepat</th>
                  <th className="py-2.5 px-3.5 font-semibold">Kategori</th>
                  <th className="py-2.5 px-3.5 font-semibold">Frekuensi Salah</th>
                  <th className="py-2.5 px-3.5 font-semibold">Catatan Perbaikan</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Suara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DCD0]">
                {mistakes.map((m) => (
                  <tr key={m.questionId} className="hover:bg-[#FBF9F5]">
                    <td className="py-3 px-3.5 font-jp text-base font-bold text-[#2C2825]">
                      {m.stimulus}
                    </td>
                    <td className="py-3 px-3.5 font-jp font-semibold text-[#1E3A2F]">
                      {m.correctAnswer}
                    </td>
                    <td className="py-3 px-3.5 uppercase font-mono-num text-[#5C554E]">
                      {m.category}
                    </td>
                    <td className="py-3 px-3.5 font-mono-num text-[#8C2D19] font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{m.missCount}x salah</span>
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-[#5C554E] max-w-md">{m.explanation}</td>
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
        )}
      </div>

      {/* Section 4: Recent Test History & Data Reset */}
      <div className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD0]">
          <div>
            <h2 className="text-base font-semibold text-[#2C2825]">
              Riwayat Sesi Ujian Simulator CBT
            </h2>
            <p className="text-xs text-[#5C554E] mt-0.5">
              Rekaman skor ujian terakhir yang disimpan di memori lokal perangkat Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetAllData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#E2DCD0] text-xs text-[#8C2D19] hover:bg-[#FBECE9] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Progres Lokal</span>
          </button>
        </div>

        {userState.testHistory.length === 0 ? (
          <div className="text-xs text-[#5C554E] py-4">
            Belum ada riwayat simulasi ujian penuh yang diselesaikan. Buka tab <strong>Simulator CBT JLPT/JFT</strong> untuk mengambil tes 15, 50, atau 100 soal.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E2DCD0] rounded-lg">
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
        )}
      </div>
    </div>
  );
};
