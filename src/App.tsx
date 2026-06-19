
import React, { useState, useEffect, useCallback } from 'react';
import { LotteryType, LotteryGame, LotteryResult, CheckedGameResult } from './types';
import { checkGame } from './services/lotteryChecker';
import ResultInput from './components/ResultInput';
import CsvUploader from './components/CsvUploader';
import GameResults from './components/GameResults';

function App() {
  const [officialQuinaResult, setOfficialQuinaResult] = useState<LotteryResult | null>(null);
  const [officialMegaSenaResult, setOfficialMegaSenaResult] = useState<LotteryResult | null>(null);
  const [uploadedGames, setUploadedGames] = useState<LotteryGame[]>([]);
  const [checkedResults, setCheckedResults] = useState<CheckedGameResult[]>([]);
  const [isCsvLoading, setIsCsvLoading] = useState<boolean>(false);
  const [isCheckingGames, setIsCheckingGames] = useState<boolean>(false);

  const handleQuinaResultsChange = useCallback((result: LotteryResult | null) => {
    setOfficialQuinaResult(result);
  }, []);

  const handleMegaSenaResultsChange = useCallback((result: LotteryResult | null) => {
    setOfficialMegaSenaResult(result);
  }, []);

  const handleGamesUpload = useCallback((games: LotteryGame[]) => {
    setUploadedGames(games);
  }, []);

  const handleCsvLoadingChange = useCallback((loading: boolean) => {
    setIsCsvLoading(loading);
  }, []);

  useEffect(() => {
    if (uploadedGames.length === 0) {
      setCheckedResults([]);
      return;
    }

    const checkAllGames = async () => {
      setIsCheckingGames(true);
      const newCheckedResults: CheckedGameResult[] = [];

      for (const game of uploadedGames) {
        let officialResult: LotteryResult | null = null;
        if (game.type === LotteryType.QUINA && officialQuinaResult?.numbers.length === 5) {
          officialResult = officialQuinaResult;
        } else if (game.type === LotteryType.MEGASENA && officialMegaSenaResult?.numbers.length === 6) {
          officialResult = officialMegaSenaResult;
        }

        if (officialResult) {
          const result = checkGame(game, officialResult);
          newCheckedResults.push(result);
        } else {
          // If no valid official result for the game type, add with 0 points
          newCheckedResults.push({
            game,
            officialNumbers: [], // Indicate no official numbers for this type yet
            matchedNumbers: [],
            points: 0,
          });
        }
      }
      setCheckedResults(newCheckedResults);
      setIsCheckingGames(false);
    };

    checkAllGames();
  }, [uploadedGames, officialQuinaResult, officialMegaSenaResult]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const hasOfficialResults = (officialQuinaResult?.numbers.length === 5 || officialMegaSenaResult?.numbers.length === 6);
  const showResults = uploadedGames.length > 0 && hasOfficialResults;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 sm:p-8 flex flex-col items-center py-12">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-10 drop-shadow-lg">
        Conferidor de Jogos
        <br className="sm:hidden" />
        <span className="text-blue-600"> Quina & Mega-Sena</span>
      </h1>

      <div className="flex flex-col md:flex-row justify-center items-start gap-8 w-full max-w-7xl">
        <div className="flex flex-col items-center w-full md:w-1/2 lg:w-1/3">
          <ResultInput lotteryType={LotteryType.QUINA} onResultsChange={handleQuinaResultsChange} />
          <ResultInput lotteryType={LotteryType.MEGASENA} onResultsChange={handleMegaSenaResultsChange} />
        </div>
        <div className="flex flex-col items-center w-full md:w-1/2 lg:w-1/3">
          <CsvUploader onGamesUpload={handleGamesUpload} isLoading={isCsvLoading} onLoadingChange={handleCsvLoadingChange} />
        </div>
      </div>

      {uploadedGames.length > 0 && (officialQuinaResult?.numbers.length === 5 || officialMegaSenaResult?.numbers.length === 6) && (
        <div className="w-full max-w-4xl mt-12">
          <GameResults
            checkedResults={checkedResults}
            officialQuinaResult={officialQuinaResult?.numbers || []}
            officialMegaSenaResult={officialMegaSenaResult?.numbers || []}
            isLoading={isCheckingGames}
          />
        </div>
      )}

      {uploadedGames.length > 0 && !(officialQuinaResult?.numbers.length === 5 || officialMegaSenaResult?.numbers.length === 6) && (
        <div className="w-full max-w-md mt-12 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 rounded-lg shadow-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            <p className="font-bold">Atenção:</p>
          </div>
          <p className="mt-2 text-sm">
            Para ver os resultados da verificação, certifique-se de ter inserido os números oficiais de pelo menos um tipo de loteria (Quina ou Mega-Sena) cujos jogos foram carregados.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
