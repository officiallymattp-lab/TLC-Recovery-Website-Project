import { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  id: string;
  name?: string;
  value: string; // Stored cleanly as ISO string YYYY-MM-DD or ''
  onChange: (isoDate: string) => void;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  minYear?: number;
  maxYear?: number;
  defaultViewYear?: number;
}

const MONTHS = [
  { value: 0, label: '01 — Jan' },
  { value: 1, label: '02 — Feb' },
  { value: 2, label: '03 — Mar' },
  { value: 3, label: '04 — Apr' },
  { value: 4, label: '05 — May' },
  { value: 5, label: '06 — Jun' },
  { value: 6, label: '07 — Jul' },
  { value: 7, label: '08 — Aug' },
  { value: 8, label: '09 — Sep' },
  { value: 9, label: '10 — Oct' },
  { value: 10, label: '11 — Nov' },
  { value: 11, label: '12 — Dec' },
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isoToDisplay(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return '';
  return `${match[2]}/${match[3]}/${match[1]}`;
}

function parseIsoParts(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const check = new Date(year, month, day);
  if (
    check.getFullYear() !== year ||
    check.getMonth() !== month ||
    check.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function formatIso(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseMaskedInputToIso(raw: string, minYear: number, maxYear: number): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw.trim());
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || year < minYear || year > maxYear) return null;
  const maxDays = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDays) return null;
  return formatIso(year, month - 1, day);
}

function formatTypingAsMaskedDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function DatePicker({
  id,
  name,
  value,
  onChange,
  placeholder = 'MM/DD/YYYY',
  required = false,
  invalid = false,
  minYear = 1935,
  maxYear = 2030,
  defaultViewYear,
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState<string>(() => isoToDisplay(value));

  const today = useMemo(() => new Date(), []);
  const initialParts = parseIsoParts(value);

  const [viewYear, setViewYear] = useState<number>(
    initialParts?.year ?? defaultViewYear ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    initialParts?.month ?? today.getMonth()
  );

  // Sync display text & calendar view when external value changes
  useEffect(() => {
    setInputText(isoToDisplay(value));
    const parts = parseIsoParts(value);
    if (parts) {
      setViewYear(parts.year);
      setViewMonth(parts.month);
    }
  }, [value]);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<number | null> = [];
    for (let i = 0; i < firstWeekday; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push(d);
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTypingAsMaskedDate(e.target.value);
    setInputText(formatted);

    if (formatted === '') {
      onChange('');
      return;
    }

    const parsedIso = parseMaskedInputToIso(formatted, minYear, maxYear);
    if (parsedIso) {
      onChange(parsedIso);
      const parts = parseIsoParts(parsedIso);
      if (parts) {
        setViewYear(parts.year);
        setViewMonth(parts.month);
      }
    }
  };

  const handleInputBlur = () => {
    if (!inputText.trim()) {
      onChange('');
      return;
    }
    const parsedIso = parseMaskedInputToIso(inputText, minYear, maxYear);
    if (parsedIso) {
      onChange(parsedIso);
      setInputText(isoToDisplay(parsedIso));
    } else if (value) {
      // Revert invalid partial input back to last valid ISO date
      setInputText(isoToDisplay(value));
    }
  };

  const handleSelectDay = (day: number) => {
    const iso = formatIso(viewYear, viewMonth, day);
    onChange(iso);
    setInputText(isoToDisplay(iso));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear > minYear) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      }
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear < maxYear) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      }
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectToday = () => {
    const now = new Date();
    const y = Math.min(maxYear, Math.max(minYear, now.getFullYear()));
    const m = now.getMonth();
    const d = now.getDate();
    setViewYear(y);
    setViewMonth(m);
    const iso = formatIso(y, m, d);
    onChange(iso);
    setInputText(isoToDisplay(iso));
    setIsOpen(false);
  };

  const selectedParts = parseIsoParts(value);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          id={id}
          name={name ?? id}
          type="text"
          inputMode="numeric"
          required={required}
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          aria-invalid={invalid}
          autoComplete="off"
          className={`w-full pr-12 px-4 py-3 rounded-lg bg-white border text-[#24201E] placeholder:text-[#57514D]/60 tabular-nums focus:outline-none focus:ring-2 ${
            invalid
              ? 'border-[#9E4B33] focus:border-[#9E4B33] focus:ring-[#9E4B33]/20'
              : 'border-[#E4DDD1] focus:border-[#2C4A3E] focus:ring-[#2C4A3E]/20'
          }`}
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Open calendar date picker"
          className="absolute right-1.5 inline-flex items-center justify-center w-9 h-9 rounded-md text-[#5B7B6D] hover:text-[#2C4A3E] hover:bg-[#E6EFEA]/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E]"
        >
          <Calendar className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute z-40 mt-2 left-0 w-[min(100vw-2rem,320px)] bg-[#FAF7F2] border border-[#E4DDD1] rounded-xl shadow-[0_14px_36px_rgba(36,32,30,0.16)] p-3.5"
        >
          {/* Month (01-12) & Year (1935-2030) Quick Jump Controls */}
          <div className="flex items-center justify-between gap-1.5 pb-3 border-b border-[#E4DDD1]">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E4DDD1] bg-white text-[#24201E] hover:bg-[#F2ECE1] transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <select
                aria-label="Select month"
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-white border border-[#E4DDD1] text-xs font-semibold text-[#24201E] tabular-nums focus:outline-none focus:border-[#2C4A3E]"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Select year"
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="w-[78px] px-2 py-1.5 rounded-lg bg-white border border-[#E4DDD1] text-xs font-semibold text-[#24201E] tabular-nums focus:outline-none focus:border-[#2C4A3E]"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E4DDD1] bg-white text-[#24201E] hover:bg-[#F2ECE1] transition-colors shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="mt-2.5 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-[11px] font-semibold text-[#57514D] py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <span key={`empty-${idx}`} aria-hidden="true" />;
              }

              const isSelected =
                selectedParts?.year === viewYear &&
                selectedParts?.month === viewMonth &&
                selectedParts?.day === day;

              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-9 w-full rounded-lg text-xs font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] ${
                    isSelected
                      ? 'bg-[#2C4A3E] text-[#FAF7F2]'
                      : isToday
                        ? 'bg-[#E6EFEA] text-[#2C4A3E] border border-[#5B7B6D]/40 hover:bg-[#d7e6de]'
                        : 'text-[#24201E] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="mt-3 pt-2.5 border-t border-[#E4DDD1] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="font-semibold text-[#2C4A3E] hover:text-[#B85D43] transition-colors px-2 py-1 rounded"
            >
              Today
            </button>
            <div className="flex items-center gap-2">
              {!required && value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setInputText('');
                    setIsOpen(false);
                  }}
                  className="font-medium text-[#57514D] hover:text-[#9E4B33] transition-colors px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close calendar"
                className="inline-flex items-center gap-1 font-medium text-[#57514D] hover:text-[#24201E] px-2 py-1 rounded"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
