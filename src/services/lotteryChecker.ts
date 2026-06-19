
import { LotteryType, LotteryGame, LotteryResult, CheckedGameResult } from '../types';

/**
 * Parses a CSV string into an array of LotteryGame objects.
 * Supports two formats per line:
 * 1. "LOTTERY_TYPE,N1,N2,N3,N4,N5(,N6 for Mega-Sena)"
 * 2. "N1,N2,N3,N4,N5(,N6)" where type is inferred from the number of numbers.
 * @param csvString The raw CSV content.
 * @returns An array of parsed LotteryGame objects.
 */
export function parseCsv(csvString: string): LotteryGame[] {
  const games: LotteryGame[] = [];
  const lines = csvString.trim().split('\n');

  lines.forEach((line, index) => {
    const rawParts = line.split(',').map(p => p.trim());
    let gameType: LotteryType | undefined;
    let numbersStr: string[] = [];

    // Attempt to determine if the first part is an explicit lottery type string
    const firstPartUpper = rawParts[0]?.toUpperCase();
    if (firstPartUpper === LotteryType.QUINA) {
      gameType = LotteryType.QUINA;
      numbersStr = rawParts.slice(1);
    } else if (firstPartUpper === LotteryType.MEGASENA) {
      gameType = LotteryType.MEGASENA;
      numbersStr = rawParts.slice(1);
    } else {
      // If no explicit type, assume all parts are numbers and infer type from count
      numbersStr = rawParts;
    }

    const numbers = numbersStr.map(Number);
    const validNumbers = numbers.filter(n => !isNaN(n) && n >= 1); // Filter out non-numeric values and numbers less than 1

    // If type was not explicitly stated, infer it from the count of valid numbers
    if (!gameType) {
      if (validNumbers.length === 5) {
        gameType = LotteryType.QUINA;
      } else if (validNumbers.length === 6) {
        gameType = LotteryType.MEGASENA;
      } else {
        console.warn(`Skipping line ${index + 1}: Não foi possível determinar o tipo de loteria com base na contagem de números (${validNumbers.length}). Linha: "${line}"`);
        return;
      }
    }

    // Now validate numbers based on the determined gameType
    const expectedNumbersCount = gameType === LotteryType.QUINA ? 5 : 6;
    if (validNumbers.length !== expectedNumbersCount) {
      console.warn(`Skipping line ${index + 1}: Contagem incorreta de números para ${gameType}. Esperado ${expectedNumbersCount}, obtido ${validNumbers.length}. Linha: "${line}"`);
      return;
    }

    // Further validation (range, uniqueness)
    const maxNumber = gameType === LotteryType.QUINA ? 80 : 60;
    const isValidRange = validNumbers.every(n => n <= maxNumber);
    const isUnique = new Set(validNumbers).size === validNumbers.length;

    if (!isValidRange) {
      console.warn(`Skipping line ${index + 1}: Números fora do intervalo para ${gameType}. Linha: "${line}"`);
      return;
    }
    if (!isUnique) {
      console.warn(`Skipping line ${index + 1}: Números duplicados detectados para ${gameType}. Linha: "${line}"`);
      return;
    }

    games.push({ id: `Jogo ${index + 1}`, type: gameType, numbers: validNumbers.sort((a, b) => a - b) });
  });
  return games;
}

/**
 * Checks a single lottery game against the official results.
 * @param game The player's lottery game.
 * @param officialResult The official lottery results.
 * @returns A CheckedGameResult object indicating matched numbers and points.
 */
export function checkGame(
  game: LotteryGame,
  officialResult: LotteryResult,
): CheckedGameResult {
  if (game.type !== officialResult.type) {
    // Return 0 points if types don't match. This case should ideally be handled upstream.
    return {
      game,
      officialNumbers: officialResult.numbers,
      matchedNumbers: [],
      points: 0,
    };
  }

  const officialNumbersSet = new Set(officialResult.numbers);
  const matchedNumbers: number[] = [];

  for (const num of game.numbers) {
    if (officialNumbersSet.has(num)) {
      matchedNumbers.push(num);
    }
  }

  const points = matchedNumbers.length; // Points are simply the count of matched numbers

  return {
    game,
    officialNumbers: officialResult.numbers,
    matchedNumbers: matchedNumbers.sort((a, b) => a - b),
    points,
  };
}
