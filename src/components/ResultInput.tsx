
import React, { useState, useEffect, useCallback } from 'react';
import { LotteryType, LotteryResult } from '../types';
import NumberInput from './NumberInput';

interface ResultInputProps {
  lotteryType: LotteryType;
  onResultsChange: (result: LotteryResult | null) => void;
}

const MAX_QUINA_NUMBER = 80;
const MAX_MEGASENA_NUMBER = 60;

const ResultInput: React.FC<ResultInputProps> = ({ lotteryType, onResultsChange }) => {
  const numFields = lotteryType === LotteryType.QUINA ? 5 : 6;
  const maxNumber = lotteryType === LotteryType.QUINA ? MAX_QUINA_NUMBER : MAX_MEGASENA_NUMBER;
  const [numbers, setNumbers] = useState<(number | '')[]>(Array(numFields).fill(''));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset numbers when lotteryType changes
    setNumbers(Array(numFields).fill(''));
    setError(null);
  }, [lotteryType, numFields]);

  const handleNumberChange = useCallback((index: number, value: number | '') => {
    setNumbers(prevNumbers => {
      const newNumbers = [...prevNumbers];
      newNumbers[index] = value;
      return newNumbers;
    });
  }, []);

  useEffect(() => {
    const filledNumbers = numbers.filter((n): n is number => n !== '');

    if (filledNumbers.length === numFields) {
      const uniqueNumbers = new Set(filledNumbers);
      if (uniqueNumbers.size !== numFields) {
        setError('Números devem ser únicos.');
        onResultsChange(null);
        return;
      }
      setError(null);
      onResultsChange({ type: lotteryType, numbers: filledNumbers.sort((a, b) => a - b) });
    } else {
      setError(null); // Clear error if not all fields are filled
      onResultsChange(null);
    }
  }, [numbers, numFields, lotteryType, onResultsChange]);

  const title = lotteryType === LotteryType.QUINA ? 'Resultado Oficial da Quina' : 'Resultado Oficial da Mega-Sena';
  const numberRangeText = lotteryType === LotteryType.QUINA ? '1 a 80' : '1 a 60';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full max-w-lg mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{title}</h2>
      <p className="text-gray-600 text-center mb-6">
        Digite os {numFields} números sorteados (de {numberRangeText}).
      </p>
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {Array.from({ length: numFields }).map((_, index) => (
          <NumberInput
            key={index}
            value={numbers[index]}
            onChange={(val) => handleNumberChange(index, val)}
            min={1}
            max={maxNumber}
            placeholder={(index + 1).toString()}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-600 text-center mt-4 text-sm font-medium">{error}</p>
      )}
      {!error && numbers.filter(n => n !== '').length === numFields && (
        <p className="text-green-600 text-center mt-4 text-sm font-medium">Resultados válidos e prontos para verificação!</p>
      )}
    </div>
  );
};

export default ResultInput;
