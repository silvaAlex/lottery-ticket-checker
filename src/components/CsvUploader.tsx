
import React, { useState, useCallback } from 'react';
import { LotteryGame } from '../types';
import { parseCsv } from '../services/lotteryChecker';

interface CsvUploaderProps {
  onGamesUpload: (games: LotteryGame[]) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onGamesUpload, isLoading, onLoadingChange }) => {
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName('');
      setError('Nenhum arquivo selecionado.');
      onGamesUpload([]);
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Por favor, selecione um arquivo CSV.');
      setFileName('');
      onGamesUpload([]);
      return;
    }

    setFileName(file.name);
    setError(null);
    onLoadingChange(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target?.result as string;
        if (csvContent) {
          try {
            const parsedGames = parseCsv(csvContent);
            if (parsedGames.length === 0 && csvContent.trim().length > 0) {
              setError('Nenhum jogo válido encontrado no CSV. Verifique o formato.');
            } else {
              onGamesUpload(parsedGames);
            }
          } catch (parseError) {
            setError(`Erro ao analisar o CSV: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
            onGamesUpload([]);
          }
        }
        onLoadingChange(false);
      };
      reader.readAsText(file);
    } catch (readError) {
      setError(`Erro ao ler o arquivo: ${readError instanceof Error ? readError.message : String(readError)}`);
      onGamesUpload([]);
      onLoadingChange(false);
    }
  }, [onGamesUpload, onLoadingChange]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full max-w-lg mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Carregar seus Jogos</h2>
      <p className="text-gray-600 text-center mb-6">
        Selecione um arquivo CSV com seus jogos. Cada linha pode ser no formato:
        <br />
        <code className="bg-gray-100 p-1 rounded-md text-sm">QUINA,N1,N2,N3,N4,N5</code> ou
        <br />
        <code className="bg-gray-100 p-1 rounded-md text-sm">N1,N2,N3,N4,N5</code> (Quina inferida)
        <br />
        <code className="bg-gray-100 p-1 rounded-md text-sm">MEGASENA,N1,N2,N3,N4,N5,N6</code> ou
        <br />
        <code className="bg-gray-100 p-1 rounded-md text-sm">N1,N2,N3,N4,N5,N6</code> (Mega-Sena inferida)
      </p>

      <label
        htmlFor="csv-upload"
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300
          ${isLoading ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 hover:bg-gray-100 border-blue-400 hover:border-blue-500'}`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2 text-blue-600">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Carregando e analisando...</span>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Clique para carregar</span> ou arraste e solte
            </p>
            <p className="text-xs text-gray-500">CSV (MAX. 5MB)</p>
          </>
        )}
        <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} disabled={isLoading} />
      </label>

      {fileName && !isLoading && (
        <p className="text-sm text-gray-700 mt-4 text-center">Arquivo selecionado: <span className="font-medium">{fileName}</span></p>
      )}
      {error && (
        <p className="text-red-600 text-center mt-4 text-sm font-medium">{error}</p>
      )}
    </div>
  );
};

export default CsvUploader;
