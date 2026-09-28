import { PlayerCard } from '../models/card.model';
import { StatDefinition } from '../models/stat-key.model';

export function getStatValue(card: PlayerCard, stat: StatDefinition): number {
  const block = stat.block === 'batting' ? card.batting : card.bowling;
  return block[stat.key as keyof typeof block] as number;
}

export function isStatAvailable(card: PlayerCard, stat: StatDefinition): boolean {
  if (stat.block === 'bowling' && card.bowling.overs === 0) {
    return false;
  }
  const value = getStatValue(card, stat);
  return value !== undefined && value !== null;
}

export type RoundResult = 'A' | 'B' | 'draw';

/** Assumes isStatAvailable(cardA, stat) and isStatAvailable(cardB, stat) are both true. */
export function compareCards(cardA: PlayerCard, cardB: PlayerCard, stat: StatDefinition): RoundResult {
  const valueA = getStatValue(cardA, stat);
  const valueB = getStatValue(cardB, stat);

  if (valueA === valueB) {
    return 'draw';
  }

  const aWins = stat.lowerIsBetter ? valueA < valueB : valueA > valueB;
  return aWins ? 'A' : 'B';
}
