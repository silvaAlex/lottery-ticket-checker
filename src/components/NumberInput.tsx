
import React from 'react';

interface NumberInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  min: number;
  max: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder = '',
  className = '',
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange('');
      return;
    }
    const num = Number(inputValue);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    } else if (inputValue === '0') { // Allow '0' temporarily to clear for new input, but don't save
        onChange('');
    } else {
        // Optionally, provide visual feedback for invalid input
        e.target.value = ''; // Clear invalid input
        onChange('');
    }
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value === '' ? '' : String(value)}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-14 h-14 text-center text-lg text-gray-800 font-medium rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${className} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
      disabled={disabled}
    />
  );
};

export default NumberInput;