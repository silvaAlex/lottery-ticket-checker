
export enum LotteryType {
  QUINA = 'QUINA',
  MEGASENA = 'MEGASENA',
}

export interface LotteryGame {
  id: string; // Unique ID for each game (e.g., line number from CSV)
  type: LotteryType;
  numbers: number[];
}

export interface LotteryResult {
  type: LotteryType;
  numbers: number[];
}

export interface CheckedGameResult {
  game: LotteryGame;
  officialNumbers: number[];
  matchedNumbers: number[];
  points: number;
}
