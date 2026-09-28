import { PlayerCard } from '../models/card.model';
import { StatDefinition } from '../models/stat-key.model';

export function getStatValue(card: PlayerCard, stat: StatDefinition): number {
  const block = stat.block === 'batting' ? card.batting : card.bowling;
  return block[stat.key as keyof typeof block] as number;
}

export function isStatAvailable(card: PlayerCard, stat: StatDefinition): boolean {
  const value = getStatValue(card, stat);
  return value !== undefined && value !== null;
}
