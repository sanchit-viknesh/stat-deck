import { PlayerCard } from '../models/card.model';
import { StatDefinition } from '../models/stat-key.model';

export function getStatValue(card: PlayerCard, stat: StatDefinition): number | null {
  const block = stat.block === 'batting' ? card.batting : card.bowling;
  return block[stat.key as keyof typeof block] as number | null;
}

export function isStatAvailable(card: PlayerCard, stat: StatDefinition): boolean {
  if (stat.block === 'bowling' && card.bowling.overs === 0) {
    return false;
  }
  return getStatValue(card, stat) !== null;
}

export type RoundResult = 'A' | 'B' | 'draw';

/** Call only when isStatAvailable is true for both cards; throws otherwise. */
export function compareCards(cardA: PlayerCard, cardB: PlayerCard, stat: StatDefinition): RoundResult {
  const valueA = getStatValue(cardA, stat);
  const valueB = getStatValue(cardB, stat);

  if (valueA === null || valueB === null) {
    throw new Error(`compareCards: "${stat.label}" is unavailable for one of the cards`);
  }

  if (valueA === valueB) {
    return 'draw';
  }

  const aWins = stat.lowerIsBetter ? valueA < valueB : valueA > valueB;
  return aWins ? 'A' : 'B';
}
