import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  badge?: string;
}

interface SmoothDropdownProps<T extends string> {
  value: T;
  options: Array<DropdownOption<T>>;
  onChange: (val: T) => void;
  ariaLabel?: string;
}

export function SmoothDropdown<T extends string>({
  value,
  options,
  onChange,
  ariaLabel = 'Pilih opsi',
}: SmoothDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left shrink-0">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          triggerHaptic('tap');
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer active:scale-[0.98] ${
          isOpen
            ? 'bg-[#FFFFFF] border-[#1E3A2F] text-[#2C2825]'
            : 'bg-[#F4EFE6] hover:bg-[#EAE3D5] border-[#D5CBB8] text-[#2C2825]'
        }`}
      >
        <span className="font-jp font-medium">{selectedOption.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#5C554E] transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#1E3A2F]' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 mt-1.5 min-w-[156px] z-40 origin-top-left rounded-xl bg-[#FBF9F5] border border-[#D5CBB8] shadow-lg p-1 focus:outline-none"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    triggerHaptic('select');
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E3A2F] text-[#FBF9F5] font-semibold'
                      : 'text-[#2C2825] hover:bg-[#EFE9DC]'
                  }`}
                >
                  <span className="font-jp">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
