import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by crop name (e.g. Wheat, Rice, Onion)...',
}) => {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <Search
        size={18}
        color="#A0AEC0"
        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <input
        type="text"
        className="form-input"
        style={{ paddingLeft: '40px' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
