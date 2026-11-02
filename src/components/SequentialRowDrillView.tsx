import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  RotateCcw,
  Check,
  X,
  Keyboard,
  ListChecks,
  Shuffle,
  Play,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ALL_KANA_ITEMS, KANA_ROWS, KanaItem } from '../data/kanaData';
import { fisherYatesShuffle, checkEssayAnswer } from '../utils/shuffle';
import { speakJapanese, playFeedbackTone, triggerHaptic } from '../utils/audio';
import { DojoUserState } from '../utils/storage';
import { SmoothDropdown } from './SmoothDropdown';

interface SequentialRowDrillViewProps {
  userState: DojoUserState;
  isFocusMode: boolean;
  onToggleFocusMode: (val: boolean) => void;
  onRecordAnswer: (params: {
    questionId: string;
    stimulus: string;
    romaji: string;
    category: 'hiragana' | 'katakana' | 'modifikasi';
    isCorrect: boolean;
    responseTimeMs: number;
    explanation: string;
  }) => void;
}

export const SequentialRowDrillView: React.FC<SequentialRowDrillViewProps> = ({
  userState,
  isFocusMode,
  onToggleFocusMode,
  onRecordAnswer,
}) => {
  const [selectedScript, setSelectedScript] = useState<'hiragana' | 'katakana' | 'both'>('hiragana');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(['a', 'ka']);
  const [orderMode, setOrderMode] = useState<'sequential' | 'mix_no_hint'>('sequential');
  const [inputMode, setInputMode] = useState<'multiple_choice' | 'essay'>('multiple_choice');
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [autoAdvanceEssay, setAutoAdvanceEssay] = useState<boolean>(true);
  const [showMobileRowSheet, setShowMobileRowSheet] = useState<boolean>(false);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [essayInput, setEssayInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'wrong';
    selectedText: string;
    correctRomaji: string;
    timeSec: number;
  } | null>(null);

  const [sessionStats, setSessionStats] = useState({
    answered: 0,
    correct: 0,
    streak: 0,
    totalTimeMs: 0,
  });

  const questionStartRef = useRef<number>(Date.now());
  const essayInputRef = useRef<HTMLInputElement | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  // Filter active pool based on selected script and rows
  const activePool: KanaItem[] = useMemo(() => {
    const filtered = ALL_KANA_ITEMS.filter((item) => {
      const scriptMatch = selectedScript === 'both' ? true : item.script === selectedScript;
      const rowMatch = selectedRowIds.includes(item.rowId);
      return scriptMatch && rowMatch;
    });

    if (filtered.length === 0) {
      return ALL_KANA_ITEMS.filter((item) => item.script === 'hiragana' && item.rowId === 'a');
    }

    if (orderMode === 'mix_no_hint') {
      return fisherYatesShuffle(filtered);
    }

    return [...filtered].sort((a, b) => a.rowOrder - b.rowOrder);
  }, [selectedScript, selectedRowIds, orderMode, shuffleSeed]);

  const currentItem: KanaItem = activePool[currentIndex % activePool.length] || activePool[0];

  const mcOptions: string[] = useMemo(() => {
    if (!currentItem) return [];
    const distractors = [...currentItem.confusableRomaji];
    const extraPool = fisherYatesShuffle(
      ALL_KANA_ITEMS.filter(
        (k) => k.romaji !== currentItem.romaji && !distractors.includes(k.romaji)
      )
    );
    while (distractors.length < 3 && extraPool.length > 0) {
      distractors.push(extraPool.shift()!.romaji);
    }
    return fisherYatesShuffle([currentItem.romaji, ...distractors.slice(0, 3)]);
  }, [currentItem, currentIndex, shuffleSeed]);

  useEffect(() => {
    questionStartRef.current = Date.now();
    if (autoSpeak && currentItem && orderMode === 'sequential') {
      speakJapanese(currentItem.kana, 0.9);
    }
    if (inputMode === 'essay') {
      setTimeout(() => essayInputRef.current?.focus(), 30);
    }
  }, [currentIndex, currentItem, inputMode, orderMode]);

  const toggleRowSelection = (rowId: string) => {
    setSelectedRowIds((prev) => {
      if (prev.includes(rowId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== rowId);
      }
      return [...prev, rowId];
    });
    setCurrentIndex(0);
    setFeedback(null);
    setEssayInput('');
  };

  const activateMixAllNoHint = () => {
    setSelectedRowIds(KANA_ROWS.map((r) => r.rowId));
    setOrderMode('mix_no_hint');
    setShuffleSeed((s) => s + 1);
    setCurrentIndex(0);
    setFeedback(null);
    setEssayInput('');
  };

  const activateSequentialBasic = () => {
    setSelectedRowIds(['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa']);
    setOrderMode('sequential');
    setCurrentIndex(0);
    setFeedback(null);
    setEssayInput('');
  };

  const handleEvaluateAnswer = (userAnswer: string, isInstantAuto: boolean = false) => {
    if (!currentItem || feedback) return;

    const elapsedMs = Math.max(150, Date.now() - questionStartRef.current);
    const isCorrect =
      inputMode === 'multiple_choice'
        ? userAnswer === currentItem.romaji
        : checkEssayAnswer(userAnswer, currentItem.acceptedRomaji);

    playFeedbackTone(isCorrect ? 'correct' : 'wrong');

    const category =
      currentItem.group === 'dakuon' || currentItem.group === 'youon'
        ? 'modifikasi'
        : currentItem.script;

    onRecordAnswer({
      questionId: `q_kana_${currentItem.id}`,
      stimulus: currentItem.kana,
      romaji: currentItem.romaji,
      category,
      isCorrect,
      responseTimeMs: elapsedMs,
      explanation: `${currentItem.kana} (${currentItem.romaji}) — ${currentItem.mnemonic}`,
    });

    setSessionStats((prev) => ({
      answered: prev.answered + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      streak: isCorrect ? prev.streak + 1 : 0,
      totalTimeMs: prev.totalTimeMs + elapsedMs,
    }));

    if (isInstantAuto && isCorrect) {
      setFeedback({
        status: 'correct',
        selectedText: userAnswer,
        correctRomaji: currentItem.romaji,
        timeSec: Number((elapsedMs / 1000).toFixed(1)),
      });
      setTimeout(() => {
        setFeedback(null);
        setEssayInput('');
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= activePool.length && orderMode === 'mix_no_hint') {
            setShuffleSeed((s) => s + 1);
            return 0;
          }
          return next % activePool.length;
        });
      }, 700);
      return;
    }

    setFeedback({
      status: isCorrect ? 'correct' : 'wrong',
      selectedText: userAnswer,
      correctRomaji: currentItem.romaji,
      timeSec: Number((elapsedMs / 1000).toFixed(1)),
    });
  };

  const advanceNextCard = () => {
    setFeedback(null);
    setEssayInput('');
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= activePool.length && orderMode === 'mix_no_hint') {
        setShuffleSeed((s) => s + 1);
        return 0;
      }
      return next % activePool.length;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          advanceNextCard();
        }
        return;
      }
      if (inputMode === 'multiple_choice' && ['1', '2', '3', '4'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (mcOptions[idx]) {
          e.preventDefault();
          handleEvaluateAnswer(mcOptions[idx]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, inputMode, mcOptions]);

  const handleEssayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEssayInput(val);

    if (autoAdvanceEssay && currentItem && !feedback) {
      const trimmed = val.trim().toLowerCase();
      if (currentItem.acceptedRomaji.includes(trimmed)) {
        handleEvaluateAnswer(trimmed, true);
      }
    }
  };

  const handleEssayFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) {
      advanceNextCard();
      return;
    }
    if (!essayInput.trim()) return;
    handleEvaluateAnswer(essayInput.trim());
  };

  const accuracyPercent =
    sessionStats.answered > 0
      ? Math.round((sessionStats.correct / sessionStats.answered) * 100)
      : 100;

  const avgSpeedSec =
    sessionStats.answered > 0
      ? (sessionStats.totalTimeMs / sessionStats.answered / 1000).toFixed(1)
      : '0.0';

  const showHint = orderMode === 'sequential' && userState.currentSenseiLevel <= 2;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Ultra-Minimalist Header & Single-Row Toolbar (No Horizontal Scrollbar) */}
      {!isFocusMode && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-[#E2DCD0]">
          <h1 className="text-base sm:text-lg font-semibold text-[#2C2825] tracking-tight truncate">
            Latihan Pelafalan & Hafalan Deret Kana
          </h1>

          {/* Single-Row Compact Control Strip */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Smooth Animated Script Dropdown (Hiragana / Katakana / Campur) */}
            <SmoothDropdown
              ariaLabel="Pilih Jenis Huruf Kana"
              value={selectedScript}
              options={[
                { value: 'hiragana', label: 'あ Hiragana' },
                { value: 'katakana', label: 'ア Katakana' },
                { value: 'both', label: 'あ/ア Campur' },
              ]}
              onChange={(val) => {
                setSelectedScript(val);
                setCurrentIndex(0);
                setFeedback(null);
              }}
            />

            {/* Input Mode Switch */}
            <div className="flex items-center p-0.5 bg-[#F4EFE6] border border-[#E2DCD0] rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('select');
                  setInputMode('multiple_choice');
                  setFeedback(null);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer active:scale-[0.98] ${
                  inputMode === 'multiple_choice'
                    ? 'bg-[#1E3A2F] text-[#FBF9F5]'
                    : 'text-[#5C554E] hover:text-[#2C2825]'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>PG</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('select');
                  setInputMode('essay');
                  setFeedback(null);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer active:scale-[0.98] ${
                  inputMode === 'essay'
                    ? 'bg-[#1E3A2F] text-[#FBF9F5]'
                    : 'text-[#5C554E] hover:text-[#2C2825]'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Esai</span>
              </button>
            </div>

            {/* Mobile Row Picker Trigger */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setShowMobileRowSheet(true);
              }}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[#FFFFFF] border border-[#D5CBB8] rounded-lg text-[#2C2825] shrink-0 cursor-pointer active:scale-[0.98]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#1E3A2F]" />
              <span>Deret ({selectedRowIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left / Center Stage: Compact Flashcard (fits 100% on mobile screen without scrolling) */}
        <div
          className={`${
            isFocusMode ? 'lg:col-span-8 lg:col-start-3' : 'lg:col-span-7'
          } bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-4 sm:p-6`}
        >
          {/* Single-Line Compact Metrics Bar */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#E2DCD0] text-[11px] text-[#5C554E] font-mono-num">
            <div className="flex items-center gap-2 sm:gap-3 truncate">
              <span>
                <strong className="text-[#2C2825]">{(currentIndex % activePool.length) + 1}</strong>/{activePool.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Akurasi <strong className="text-[#2C2825]">{accuracyPercent}%</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="text-[#2C2825]">{avgSpeedSec}d</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 font-sans">
              <button
                type="button"
                onClick={() => setAutoSpeak((v) => !v)}
                className="text-[11px] text-[#5C554E] hover:text-[#2C2825] underline underline-offset-2 cursor-pointer"
              >
                Suara: {autoSpeak ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() => onToggleFocusMode(!isFocusMode)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#E2DCD0] text-[11px] font-medium cursor-pointer"
                title={isFocusMode ? 'Keluar Mode Fokus' : 'Mode Fokus Tanpa Scroll'}
              >
                {isFocusMode ? (
                  <>
                    <Minimize2 className="w-3 h-3 text-[#1E3A2F]" />
                    <span>Normal</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3 text-[#1E3A2F]" />
                    <span>Fokus</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Character Stage */}
          {currentItem && (
            <div className="flex flex-col items-center text-center py-1 sm:py-3">
              <div className="flex items-center gap-1.5 text-[11px] text-[#857D74]">
                <span>{currentItem.script === 'hiragana' ? 'Hiragana' : 'Katakana'}</span>
              </div>

              <div className="relative flex items-center justify-center my-2 sm:my-4">
                <span className="font-jp text-6xl sm:text-8xl font-bold text-[#2C2825] select-none tracking-tight leading-none">
                  {currentItem.kana}
                </span>
                <button
                  type="button"
                  onClick={() => speakJapanese(currentItem.kana, 0.85)}
                  title="Dengarkan Pelafalan Jepang (ja-JP)"
                  className="ml-3 p-2 rounded-lg bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#E2DCD0] transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {showHint ? (
                <p className="text-[11px] sm:text-xs text-[#5C554E] max-w-md line-clamp-1">
                  Petunjuk: {currentItem.mnemonic}
                </p>
              ) : (
                <p className="text-[11px] text-[#857D74]">
                  {orderMode === 'mix_no_hint'
                    ? 'Mode Mix Tanpa Bantuan (< 3 detik)'
                    : 'Pilih atau ketik Romaji yang tepat'}
                </p>
              )}

              {/* Answer Input Area */}
              <div className="w-full max-w-md mt-3.5 sm:mt-6">
                {inputMode === 'multiple_choice' ? (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {mcOptions.map((opt, idx) => {
                      const isSelected = feedback?.selectedText === opt;
                      const isRightOption = opt === currentItem.romaji;

                      let btnStyle =
                        'bg-[#FBF9F5] hover:bg-[#F4EFE6] text-[#2C2825] border-[#D5CBB8]';
                      if (feedback) {
                        if (isRightOption) {
                          btnStyle = 'bg-[#EBF3EE] text-[#1E3A2F] border-[#1E3A2F] font-semibold';
                        } else if (isSelected && !isRightOption) {
                          btnStyle = 'bg-[#FBECE9] text-[#8C2D19] border-[#8C2D19]';
                        } else {
                          btnStyle = 'bg-[#FBF9F5] text-[#857D74] border-[#E2DCD0] opacity-60';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={!!feedback}
                          onClick={() => handleEvaluateAnswer(opt)}
                          className={`min-h-[44px] flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base font-mono-num transition-colors cursor-pointer ${btnStyle}`}
                        >
                          <span className="text-[11px] text-[#857D74]">{idx + 1}.</span>
                          <span className="text-base sm:text-lg font-medium">{opt}</span>
                          <span className="w-4">
                            {feedback && isRightOption && <Check className="w-4 h-4 text-[#1E3A2F]" />}
                            {feedback && isSelected && !isRightOption && <X className="w-4 h-4 text-[#8C2D19]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <form onSubmit={handleEssayFormSubmit} className="space-y-2.5">
                    <input
                      ref={essayInputRef}
                      type="text"
                      inputMode="text"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      value={essayInput}
                      onChange={handleEssayInputChange}
                      placeholder="Ketik romaji (ka, shi, tsu)..."
                      className="w-full px-3.5 py-2.5 sm:py-3 text-center text-base sm:text-lg font-mono-num bg-[#FBF9F5] border border-[#C9C0B1] focus:border-[#1E3A2F] focus:outline-none rounded-lg text-[#2C2825]"
                    />
                    <div className="flex items-center justify-between text-[11px] text-[#5C554E]">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoAdvanceEssay}
                          onChange={(e) => setAutoAdvanceEssay(e.target.checked)}
                          className="accent-[#1E3A2F]"
                        />
                        <span>Auto-lanjut saat benar</span>
                      </label>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-[#1E3A2F] text-[#FBF9F5] rounded-md font-medium hover:bg-[#152A22] transition-colors cursor-pointer"
                      >
                        {feedback ? 'Lanjut' : 'Periksa'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Compact Feedback Bar */}
              {feedback && (
                <div
                  className={`w-full max-w-md mt-3 p-3 rounded-lg border text-left transition-opacity ${
                    feedback.status === 'correct'
                      ? 'bg-[#EBF3EE] border-[#B8D4C4] text-[#1E3A2F]'
                      : 'bg-[#FBECE9] border-[#E6B8AF] text-[#7A2312]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {feedback.status === 'correct' ? (
                        <>
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Benar! 【{currentItem.kana} = {currentItem.romaji}】 ({feedback.timeSec}d)</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 shrink-0" />
                          <span>Salah — Kunci: &ldquo;{feedback.correctRomaji}&rdquo;</span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={advanceNextCard}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#2C2825] text-[#FBF9F5] rounded hover:opacity-90 shrink-0 cursor-pointer"
                    >
                      Lanjut
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Mode Bar on Mobile Bottom of Card */}
              <div className="w-full max-w-md mt-3 pt-2.5 border-t border-[#E2DCD0] flex items-center justify-between gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={
                    orderMode === 'sequential' ? activateMixAllNoHint : activateSequentialBasic
                  }
                  className="inline-flex items-center gap-1 text-[#1E3A2F] font-medium hover:underline cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>
                    {orderMode === 'sequential'
                      ? 'Aktifkan Mix Semua Tanpa Bantuan'
                      : 'Kembali ke Urutan Deret Standar'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileRowSheet(true)}
                  className="lg:hidden text-[#5C554E] hover:text-[#2C2825] underline cursor-pointer"
                >
                  Pilih Baris ({selectedRowIds.length})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Zone (Desktop Only when not in Focus Mode): Row Selector Deck */}
        {!isFocusMode && (
          <div className="hidden lg:block lg:col-span-5 bg-[#F4EFE6] border border-[#E2DCD0] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#2C2825]">
                  Pilih Deret Urutan & Mode Acak
                </h2>
                <p className="text-xs text-[#5C554E]">
                  Klik deret untuk latihan bertahap atau Mix Semua Tanpa Bantuan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={activateSequentialBasic}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  orderMode === 'sequential'
                    ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                    : 'bg-[#FBF9F5] text-[#2C2825] border-[#D5CBB8] hover:bg-[#FFFFFF]'
                }`}
              >
                <Play className="w-3.5 h-3.5 shrink-0" />
                <span>Urutan Deret Standar</span>
              </button>

              <button
                type="button"
                onClick={activateMixAllNoHint}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  orderMode === 'mix_no_hint'
                    ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                    : 'bg-[#FBF9F5] text-[#2C2825] border-[#D5CBB8] hover:bg-[#FFFFFF]'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5 shrink-0" />
                <span>Mix Semua (Tanpa Bantuan)</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {KANA_ROWS.map((row) => {
                const isSelected = selectedRowIds.includes(row.rowId);
                const preview =
                  selectedScript === 'katakana' ? row.previewKatakana : row.previewHiragana;

                return (
                  <button
                    key={row.rowId}
                    type="button"
                    onClick={() => toggleRowSelection(row.rowId)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFFFFF] border-[#1E3A2F] text-[#2C2825]'
                        : 'bg-[#FBF9F5]/70 border-[#E2DCD0] text-[#5C554E] hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#2C2825]">{row.title}</div>
                      <div className="text-[11px] text-[#857D74] font-mono-num">{row.shortLabel}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-jp text-xs font-medium text-[#2C2825]">{preview}</span>
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                          isSelected
                            ? 'bg-[#1E3A2F] border-[#1E3A2F] text-[#FBF9F5]'
                            : 'border-[#C9C0B1]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#E2DCD0] flex items-center justify-between text-xs text-[#5C554E]">
              <span>{selectedRowIds.length} deret dipilih</span>
              <button
                type="button"
                onClick={() => {
                  setSessionStats({ answered: 0, correct: 0, streak: 0, totalTimeMs: 0 });
                  setCurrentIndex(0);
                  setFeedback(null);
                }}
                className="flex items-center gap-1 text-[#2C2825] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Sesi</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet for Selecting Kana Rows (Prevents long page scrolling on mobile) */}
      {showMobileRowSheet && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center bg-black/40">
          <div className="w-full max-h-[82dvh] bg-[#FBF9F5] rounded-t-2xl border-t border-[#E2DCD0] p-4 flex flex-col space-y-3">
            <div className="w-10 h-1 bg-[#C9C0B1] rounded-full mx-auto" />
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DCD0]">
              <h3 className="text-sm font-semibold text-[#2C2825]">
                Pilih Deret Kana ({selectedRowIds.length} Aktif)
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileRowSheet(false)}
                className="px-3 py-1 rounded-md bg-[#1E3A2F] text-[#FBF9F5] text-xs font-semibold cursor-pointer"
              >
                Selesai
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={activateSequentialBasic}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium ${
                  orderMode === 'sequential'
                    ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                    : 'bg-[#FFFFFF] text-[#2C2825] border-[#D5CBB8]'
                }`}
              >
                Urutan Deret Standar
              </button>
              <button
                type="button"
                onClick={activateMixAllNoHint}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium ${
                  orderMode === 'mix_no_hint'
                    ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                    : 'bg-[#FFFFFF] text-[#2C2825] border-[#D5CBB8]'
                }`}
              >
                Mix Semua Tanpa Bantuan
              </button>
            </div>

            <div className="overflow-y-auto space-y-1.5 pr-1 flex-1">
              {KANA_ROWS.map((row) => {
                const isSelected = selectedRowIds.includes(row.rowId);
                return (
                  <button
                    key={row.rowId}
                    type="button"
                    onClick={() => toggleRowSelection(row.rowId)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left ${
                      isSelected
                        ? 'bg-[#FFFFFF] border-[#1E3A2F] text-[#2C2825]'
                        : 'bg-[#F4EFE6]/60 border-[#E2DCD0] text-[#5C554E]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{row.title}</div>
                      <div className="text-[10px] font-mono-num text-[#857D74]">{row.shortLabel}</div>
                    </div>
                    <span className="font-jp text-xs font-medium">{row.previewHiragana}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
