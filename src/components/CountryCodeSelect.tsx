import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Country, getEnabledCountries } from '@/data/countries';

interface CountryCodeSelectProps {
  selected: Country;
  onChange: (country: Country) => void;
}

const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  selected,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const enabledCountries = getEnabledCountries();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onChange(country);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 h-10 text-sm hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="text-sm font-medium whitespace-nowrap">
          {selected.dialCode}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-background border border-input rounded-md shadow-lg z-50">
          {enabledCountries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleSelect(country)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors ${
                selected.code === country.code ? 'bg-accent' : ''
              }`}
            >
              <span className="text-lg leading-none">{country.flag}</span>
              <span className="flex-1 truncate">{country.name}</span>
              <span className="text-muted-foreground">{country.dialCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelect;
