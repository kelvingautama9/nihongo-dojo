import React, { useState } from 'react';
import { Volume2, Eye, EyeOff, Hand } from 'lucide-react';
import {
  ALL_KANA_ITEMS,
  KANA_ROWS,
  MORA_COMPARISON_PAIRS,
  VISUAL_TRAP_PAIRS,
  MNN_STUDY_SENTENCES,
} from '../data/kanaData';
import { speakJapanese, playFeedbackTone } from '../utils/audio';
import { DojoUserState } from '../utils/storage';

interface SenseiStudyViewProps {
  userState: DojoUserState;
}

export const SenseiStudyView: React.FC<SenseiStudyViewProps> = ({ userState }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'sokuon_chouon' | 'kana_matrix' | 'visual_traps' | 'mnn_grammar'
  >('sokuon_chouon');
  const [matrixScript, setMatrixScript] = useState<'hiragana' | 'katakana'>('hiragana');
  const [activeMoraId, setActiveMoraId] = useState<string | null>(null);
  const [activeBeatIdx, setActiveBeatIdx] = useState<number>(-1);

  // Adaptive Romaji visibility based on Sensei Level (Level 4-5 automatically hides Romaji by default)
  const isHighLevel = userState.currentSenseiLevel >= 4;
  const [hideRomajiOverride, setHideRomajiOverride] = useState<boolean | null>(null);
  const hideRomaji = hideRomajiOverride !== null ? hideRomajiOverride : isHighLevel;

  const playMoraRhythm = (id: string, kanaText: string, beatsCount: number) => {
    setActiveMoraId(id);
    setActiveBeatIdx(0);
    speakJapanese(kanaText, 0.75);

    for (let i = 0; i < beatsCount; i++) {
      setTimeout(() => {
        setActiveBeatIdx(i);
        playFeedbackTone('beat');
      }, i * 380);
    }

    setTimeout(() => {
      setActiveMoraId(null);
      setActiveBeatIdx(-1);
    }, beatsCount * 380 + 250);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Compact Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 pb-3 border-b border-[#E2DCD0]">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#5C554E] truncate">
            <span>Menu A · Modul Sensei</span>
            <span aria-hidden="true">·</span>
            <span>Minna no Nihongo Bab 1–5</span>
          </div>
          <h1 className="text-base sm:text-xl font-semibold text-[#2C2825] tracking-tight">
            Panduan Ketukan Mora, Huruf Mirip & Kalimat N5
          </h1>
        </div>

        {/* Sub-module Tabs (Single-line horizontal scroll on mobile) */}
        <div className="flex items-center gap-1 p-1 bg-[#F4EFE6] border border-[#E2DCD0] rounded-lg overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'sokuon_chouon', label: '01. Sokuon & Chouon' },
              { id: 'kana_matrix', label: '02. Tabel Kana' },
              { id: 'visual_traps', label: '03. Huruf Mirip' },
              { id: 'mnn_grammar', label: '04. Kalimat N5' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#1E3A2F] text-[#FBF9F5]'
                  : 'text-[#5C554E] hover:text-[#2C2825]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: SOKUON & CHOUON MORA RHYTHM */}
      {activeSubTab === 'sokuon_chouon' && (
        <div className="space-y-6">
          <div className="bg-[#F4EFE6] border border-[#E2DCD0] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-[#2C2825] flex items-center gap-2">
                <Hand className="w-4 h-4 text-[#1E3A2F]" />
                <span>Protokol Hukum Ketukan Tangan (Mora Rhythm)</span>
              </h2>
              <p className="text-xs text-[#5C554E] leading-relaxed max-w-3xl">
                Bahasa Jepang berbasis ketukan (Mora). Saat bertemu <strong>Sokuon (っ/ッ kecil)</strong>, tahan napas 1 ketukan penuh tanpa suara. Saat bertemu <strong>Chouon (Vokal Panjang)</strong>, ayunkan suara memanjang 2 ketukan penuh. Klik tombol audio untuk mendengar perbandingan ketukan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MORA_COMPARISON_PAIRS.map((pair) => (
              <div
                key={pair.id}
                className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between text-xs text-[#857D74] border-b border-[#E2DCD0] pb-2.5">
                  <span className="font-medium text-[#2C2825]">{pair.title}</span>
                  <span className="uppercase font-mono-num">{pair.category}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Short / Normal Word */}
                  <div className="p-3.5 rounded-lg bg-[#FBF9F5] border border-[#E2DCD0] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-jp text-2xl font-bold text-[#2C2825]">
                          {pair.shortWord.kana}
                        </div>
                        {!hideRomaji && (
                          <div className="font-mono-num text-xs text-[#5C554E]">
                            {pair.shortWord.romaji}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          playMoraRhythm(
                            `${pair.id}_short`,
                            pair.shortWord.kana,
                            pair.shortWord.moraBeats.length
                          )
                        }
                        className="p-2 rounded-lg bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#D5CBB8] transition-colors cursor-pointer"
                        title="Dengar Ketukan"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-[#2C2825] font-medium">
                      {pair.shortWord.meaning}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {pair.shortWord.moraBeats.map((beat, idx) => {
                        const isBeatActive =
                          activeMoraId === `${pair.id}_short` && activeBeatIdx === idx;
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 text-[11px] font-mono-num rounded border transition-colors ${
                              isBeatActive
                                ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                                : 'bg-[#FFFFFF] text-[#5C554E] border-[#E2DCD0]'
                            }`}
                          >
                            {beat}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modified Sokuon / Chouon Word */}
                  <div className="p-3.5 rounded-lg bg-[#F4EFE6]/70 border border-[#C9C0B1] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-jp text-2xl font-bold text-[#1E3A2F]">
                          {pair.modifiedWord.kana}
                        </div>
                        {!hideRomaji && (
                          <div className="font-mono-num text-xs text-[#1E3A2F] font-medium">
                            {pair.modifiedWord.romaji}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          playMoraRhythm(
                            `${pair.id}_mod`,
                            pair.modifiedWord.kana,
                            pair.modifiedWord.moraBeats.length
                          )
                        }
                        className="p-2 rounded-lg bg-[#1E3A2F] hover:bg-[#152A22] text-[#FBF9F5] transition-colors cursor-pointer"
                        title="Dengar Ketukan"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-[#2C2825] font-medium">
                      {pair.modifiedWord.meaning}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {pair.modifiedWord.moraBeats.map((beat, idx) => {
                        const isBeatActive =
                          activeMoraId === `${pair.id}_mod` && activeBeatIdx === idx;
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 text-[11px] font-mono-num rounded border transition-colors ${
                              isBeatActive
                                ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                                : 'bg-[#FFFFFF] text-[#2C2825] border-[#C9C0B1]'
                            }`}
                          >
                            {beat}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#5C554E] pt-1">
                  Catatan Sensei: {pair.senseiNote}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INTERACTIVE KANA MATRIX (CLICK TO HEAR) */}
      {activeSubTab === 'kana_matrix' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F4EFE6] border border-[#E2DCD0] rounded-xl p-4">
            <div className="text-xs text-[#5C554E]">
              Klik karakter mana saja untuk mendengar pelafalan asli Jepang (<code className="font-mono-num">ja-JP</code>). Persentase di sudut kartu menunjukkan akurasi hafalan Anda.
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#FBF9F5] border border-[#E2DCD0] rounded-lg">
              <button
                type="button"
                onClick={() => setMatrixScript('hiragana')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  matrixScript === 'hiragana'
                    ? 'bg-[#1E3A2F] text-[#FBF9F5]'
                    : 'text-[#5C554E] hover:text-[#2C2825]'
                }`}
              >
                Tabel Hiragana (あ)
              </button>
              <button
                type="button"
                onClick={() => setMatrixScript('katakana')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  matrixScript === 'katakana'
                    ? 'bg-[#1E3A2F] text-[#FBF9F5]'
                    : 'text-[#5C554E] hover:text-[#2C2825]'
                }`}
              >
                Tabel Katakana (ア)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {KANA_ROWS.map((row) => {
              const rowItems = ALL_KANA_ITEMS.filter(
                (k) => k.script === matrixScript && k.rowId === row.rowId
              );
              return (
                <div
                  key={row.rowId}
                  className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2DCD0]">
                    <span className="text-sm font-semibold text-[#2C2825]">{row.title}</span>
                    <span className="text-xs font-mono-num text-[#857D74]">{row.shortLabel}</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                    {rowItems.map((item) => {
                      const stat = userState.itemStats[`q_kana_${item.id}`];
                      const acc =
                        stat && stat.attempts > 0
                          ? Math.round((stat.correct / stat.attempts) * 100)
                          : null;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => speakJapanese(item.kana, 0.85)}
                          title={item.mnemonic}
                          className="group flex flex-col items-center justify-center p-3 rounded-lg bg-[#FBF9F5] hover:bg-[#F4EFE6] border border-[#E2DCD0] hover:border-[#1E3A2F] transition-colors cursor-pointer"
                        >
                          <div className="w-full flex items-center justify-between text-[10px] text-[#857D74] font-mono-num">
                            <span>{acc !== null ? `${acc}%` : '—'}</span>
                            <Volume2 className="w-3 h-3 opacity-50 group-hover:opacity-100 text-[#1E3A2F]" />
                          </div>
                          <span className="font-jp text-2xl sm:text-3xl font-bold text-[#2C2825] my-1">
                            {item.kana}
                          </span>
                          <span className="font-mono-num text-xs font-medium text-[#5C554E]">
                            {item.romaji}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: VISUAL TRAPS CHEAT SHEET */}
      {activeSubTab === 'visual_traps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VISUAL_TRAP_PAIRS.map((trap) => (
            <div
              key={trap.id}
              className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold text-[#2C2825] pb-2.5 border-b border-[#E2DCD0]">
                {trap.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trap.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-[#FBF9F5] border border-[#E2DCD0] flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-jp text-3xl font-bold text-[#2C2825]">
                          {item.kana}
                        </span>
                        <span className="font-mono-num text-sm font-semibold text-[#1E3A2F]">
                          ({item.romaji})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(item.kana.split(' ')[0], 0.85)}
                        className="p-1.5 rounded-md bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#D5CBB8] cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-[#5C554E] leading-relaxed">{item.visualCue}</p>
                    <div className="pt-1 border-t border-[#E2DCD0] text-[11px] font-mono-num text-[#2C2825]">
                      Contoh: {item.exampleWord}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 4: MNN SENTENCE BREAKDOWN & GRAMMAR NOTES (WITH ADAPTIVE ROMAJI) */}
      {activeSubTab === 'mnn_grammar' && (
        <div className="space-y-5">
          {/* Adaptive Romaji Control Bar */}
          <div className="bg-[#F4EFE6] border border-[#E2DCD0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-[#2C2825]">
                Mode Tampilan Bantuan Alfabet (Romaji) Adaptif
              </div>
              <p className="text-xs text-[#5C554E]">
                {hideRomaji
                  ? 'Mode Level Tinggi aktif: Teks alfabet ( seperti "watashi wa kelvin desu" ) disembunyikan agar Anda fokus membaca Hiragana/Katakana, arti Indonesia, dan struktur gramatika.'
                  : 'Mode Level Awal aktif: Cara baca alfabet (Romaji) dan arti setiap kata ditampilkan secara terperinci untuk membantu memahami setiap komponen kalimat.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setHideRomajiOverride(!hideRomaji)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#FBF9F5] border border-[#C9C0B1] text-xs font-medium text-[#2C2825] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {hideRomaji ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#1E3A2F]" />
                  <span>Tampilkan Bantuan Romaji (Level Awal)</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#1E3A2F]" />
                  <span>Sembunyikan Romaji (Simulasi Level Tinggi)</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {MNN_STUDY_SENTENCES.map((sent) => (
              <div
                key={sent.id}
                className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2DCD0]">
                  <div className="flex items-center gap-2 text-xs text-[#5C554E]">
                    <span className="font-semibold text-[#2C2825]">{sent.chapter}</span>
                    <span aria-hidden="true">·</span>
                    <span>{sent.grammarTitle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakJapanese(sent.japaneseKana, 0.85)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4EFE6] hover:bg-[#EAE3D5] text-xs font-medium text-[#2C2825] border border-[#D5CBB8] cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Dengarkan Kalimat</span>
                  </button>
                </div>

                {/* Primary Sentence Display */}
                <div className="space-y-1.5">
                  <div className="font-jp text-xl sm:text-2xl font-bold text-[#2C2825] tracking-wide">
                    {sent.japaneseKana}
                  </div>
                  {/* Full Romaji line is ONLY shown when hideRomaji is false (Level Awal) */}
                  {!hideRomaji && (
                    <div className="font-mono-num text-sm text-[#1E3A2F] font-medium">
                      {sent.romajiFull}
                    </div>
                  )}
                  <div className="text-sm text-[#5C554E]">
                    Arti Indonesia: <strong className="text-[#2C2825]">&ldquo;{sent.indonesian}&rdquo;</strong>
                  </div>
                </div>

                {/* Word-by-Word Breakdown Cards */}
                <div className="pt-1">
                  <div className="text-xs font-medium text-[#857D74] mb-2">
                    Bedah Kosakata & Partikel Per Kata:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {sent.tokens.map((tok, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => speakJapanese(tok.kana, 0.85)}
                        className="p-2.5 rounded-lg bg-[#FBF9F5] hover:bg-[#F4EFE6] border border-[#E2DCD0] text-left transition-colors cursor-pointer"
                      >
                        <div className="font-jp text-base font-bold text-[#2C2825]">
                          {tok.kana}
                        </div>
                        {!hideRomaji && (
                          <div className="font-mono-num text-xs text-[#1E3A2F] font-medium mt-0.5">
                            {tok.romaji}
                          </div>
                        )}
                        <div className="text-xs text-[#2C2825] mt-1">{tok.meaning}</div>
                        {tok.grammarRole && (
                          <div className="text-[10px] text-[#857D74] mt-0.5">{tok.grammarRole}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Concise Grammar Structure Note */}
                <div className="p-3.5 rounded-lg bg-[#F4EFE6] border border-[#E2DCD0] text-xs text-[#2C2825] leading-relaxed">
                  <span className="font-semibold text-[#1E3A2F]">Penjelasan Gramatika Ringkas: </span>
                  {sent.grammarSummary}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
