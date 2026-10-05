import { BattingStats, BowlingStats, PlayerCard, Sport } from '../models/card.model';
import { Deck } from '../models/deck.model';

export class DeckFormatError extends Error {
  override name = 'DeckFormatError';
}

type JsonObject = Record<string, unknown>;

const SPORTS: readonly Sport[] = ['cricket'];

function asObject(value: unknown, path: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new DeckFormatError(`${path} must be an object`);
  }
  return value as JsonObject;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new DeckFormatError(`${path} must be a non-empty string`);
  }
  return value;
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new DeckFormatError(`${path} must be a number`);
  }
  return value;
}

function asNumberOrNull(value: unknown, path: string): number | null {
  return value === null ? null : asNumber(value, path);
}

function asSport(value: unknown, path: string): Sport {
  if (!SPORTS.includes(value as Sport)) {
    throw new DeckFormatError(`${path} must be one of: ${SPORTS.join(', ')}`);
  }
  return value as Sport;
}

function parseBatting(raw: unknown, path: string): BattingStats {
  const o = asObject(raw, path);
  const n = (key: keyof BattingStats) => asNumber(o[key], `${path}.${key}`);
  return {
    matches: n('matches'),
    innings: n('innings'),
    notOuts: n('notOuts'),
    runs: n('runs'),
    highestScore: n('highestScore'),
    average: n('average'),
    ballsFaced: n('ballsFaced'),
    strikeRate: n('strikeRate'),
    hundreds: n('hundreds'),
    fifties: n('fifties'),
  };
}

function parseBowling(raw: unknown, path: string): BowlingStats {
  const o = asObject(raw, path);
  const bowling: BowlingStats = {
    overs: asNumber(o['overs'], `${path}.overs`),
    runs: asNumber(o['runs'], `${path}.runs`),
    wickets: asNumber(o['wickets'], `${path}.wickets`),
    bestBowling: asString(o['bestBowling'], `${path}.bestBowling`),
    average: asNumberOrNull(o['average'], `${path}.average`),
    economyRate: asNumberOrNull(o['economyRate'], `${path}.economyRate`),
  };
  if (bowling.wickets === 0 && bowling.average !== null) {
    throw new DeckFormatError(`${path}.average must be null when wickets is 0`);
  }
  if (bowling.overs === 0 && bowling.economyRate !== null) {
    throw new DeckFormatError(`${path}.economyRate must be null when overs is 0`);
  }
  return bowling;
}

function parseCard(raw: unknown, path: string, deckSport: Sport): PlayerCard {
  const o = asObject(raw, path);
  const sport = asSport(o['sport'], `${path}.sport`);
  if (sport !== deckSport) {
    throw new DeckFormatError(`${path}.sport is "${sport}" but the deck is "${deckSport}"`);
  }
  const card: PlayerCard = {
    id: asString(o['id'], `${path}.id`),
    name: asString(o['name'], `${path}.name`),
    team: asString(o['team'], `${path}.team`),
    sport,
    batting: parseBatting(o['batting'], `${path}.batting`),
    bowling: parseBowling(o['bowling'], `${path}.bowling`),
  };
  if (o['photoUrl'] !== undefined) {
    card.photoUrl = asString(o['photoUrl'], `${path}.photoUrl`);
  }
  return card;
}

/** Validates untrusted deck JSON and returns a typed Deck, or throws DeckFormatError naming the bad field. */
export function parseDeck(raw: unknown): Deck {
  const o = asObject(raw, 'deck');
  const sport = asSport(o['sport'], 'deck.sport');
  const generatedAt = asString(o['generatedAt'], 'deck.generatedAt');

  if (!Array.isArray(o['cards']) || o['cards'].length === 0) {
    throw new DeckFormatError('deck.cards must be a non-empty array');
  }
  const cards = o['cards'].map((c, i) => parseCard(c, `cards[${i}]`, sport));

  const seen = new Set<string>();
  for (const card of cards) {
    if (seen.has(card.id)) {
      throw new DeckFormatError(`duplicate card id "${card.id}"`);
    }
    seen.add(card.id);
  }

  return { sport, generatedAt, cards };
}
