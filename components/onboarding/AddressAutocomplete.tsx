'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  if (!query?.trim() || query.trim().length < 2) return [];
  const q = query.trim().includes('대한민국') ? query.trim() : `${query.trim()}, 대한민국`;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=kr&limit=5&addressdetails=1`,
      { headers: { 'Accept-Language': 'ko' } }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('Address search failed:', e);
    return [];
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface AddressAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  inputClassName?: string;
}

export function AddressAutocomplete({
  id,
  label,
  value,
  onChange,
  placeholder = '예: 서울 강남구 역삼동',
  icon,
  inputClassName,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchAddress(debouncedValue).then((list) => {
      if (!cancelled) {
        setSuggestions(list);
        setOpen(list.length > 0);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [debouncedValue]);

  const handleSelect = useCallback(
    (item: AddressSuggestion) => {
      onChange(item.display_name);
      setOpen(false);
      setSuggestions([]);
    },
    [onChange]
  );

  return (
    <div ref={wrapperRef} className="relative">
      <Label className="text-[#636E72] text-sm flex items-center gap-2 mb-1">
        {icon}
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
      />
      {open && (suggestions.length > 0 || loading) && (
        <ul className="absolute top-full left-0 right-0 mt-1 z-[100] max-h-[220px] overflow-y-auto rounded-lg border border-[#2D3436]/20 bg-white shadow-lg">
          {loading ? (
            <li className="px-4 py-3 text-[#636E72] text-sm">검색 중...</li>
          ) : (
            suggestions.map((item, i) => (
              <li
                key={`${item.lat}-${item.lon}-${i}`}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSelect(item);
                }}
                className="px-4 py-2.5 text-sm text-[#2D3436] hover:bg-[#2A3A4A] cursor-pointer border-b border-[#2D3436]/10 last:border-0"
              >
                {item.display_name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
