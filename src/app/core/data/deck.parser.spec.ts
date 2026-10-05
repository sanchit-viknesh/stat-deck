import { DeckFormatError, parseDeck } from './deck.parser';

function validCard(id = 'test-batter'): Record<string, unknown> {
  return {
    id,
    name: 'Test Batter',
    team: 'Testland',
    sport: 'cricket',
    batting: {
      matches: 100, innings: 95, notOuts: 10, runs: 4200, highestScore: 150,
      average: 49.41, ballsFaced: 5000, strikeRate: 84, hundreds: 12, fifties: 20,
    },
    bowling: { overs: 0, runs: 0, wickets: 0, bestBowling: '0/0', average: null, economyRate: null },
  };
}

function validDeck(): Record<string, unknown> {
  return { sport: 'cricket', generatedAt: '2026-01-01T00:00:00Z', cards: [validCard()] };
}

describe('parseDeck', () => {
  it('returns a typed deck for valid input', () => {
    const deck = parseDeck(validDeck());
    expect(deck.cards.length).toBe(1);
    expect(deck.cards[0].batting.runs).toBe(4200);
    expect(deck.cards[0].bowling.bestBowling).toBe('0/0');
  });

  it('drops fields that are not part of the model', () => {
    const raw = validDeck();
    (raw['cards'] as Record<string, unknown>[])[0]['secret'] = 'x';
    expect('secret' in parseDeck(raw).cards[0]).toBeFalse();
  });

  it('keeps photoUrl when it is a string', () => {
    const raw = validDeck();
    (raw['cards'] as Record<string, unknown>[])[0]['photoUrl'] = 'img/a.png';
    expect(parseDeck(raw).cards[0].photoUrl).toBe('img/a.png');
  });

  it('rejects input that is not an object', () => {
    expect(() => parseDeck(null)).toThrowError(DeckFormatError, 'deck must be an object');
    expect(() => parseDeck([])).toThrowError(DeckFormatError, 'deck must be an object');
  });

  it('rejects an unknown sport', () => {
    const raw = { ...validDeck(), sport: 'tennis' };
    expect(() => parseDeck(raw)).toThrowError(DeckFormatError, 'deck.sport must be one of: cricket');
  });

  it('rejects an empty card list', () => {
    const raw = { ...validDeck(), cards: [] };
    expect(() => parseDeck(raw)).toThrowError(DeckFormatError, 'deck.cards must be a non-empty array');
  });

  it('names the exact field when a stat is missing', () => {
    const card = validCard();
    delete (card['batting'] as Record<string, unknown>)['runs'];
    const raw = { ...validDeck(), cards: [validCard('a'), card] };
    expect(() => parseDeck(raw)).toThrowError(DeckFormatError, 'cards[1].batting.runs must be a number');
  });

  it('rejects numbers stored as strings', () => {
    const card = validCard();
    (card['bowling'] as Record<string, unknown>)['economyRate'] = '4.5';
    const raw = { ...validDeck(), cards: [card] };
    expect(() => parseDeck(raw)).toThrowError(DeckFormatError, 'cards[0].bowling.economyRate must be a number');
  });

  it('accepts null averages for a bowler who took no wickets', () => {
    const card = validCard();
    card['bowling'] = { overs: 3, runs: 17, wickets: 0, bestBowling: '0/5', average: null, economyRate: 5.67 };
    const deck = parseDeck({ ...validDeck(), cards: [card] });
    expect(deck.cards[0].bowling.average).toBeNull();
    expect(deck.cards[0].bowling.economyRate).toBe(5.67);
  });

  it('rejects a fake 0 average when no wickets were taken', () => {
    const card = validCard();
    card['bowling'] = { overs: 3, runs: 17, wickets: 0, bestBowling: '0/5', average: 0, economyRate: 5.67 };
    expect(() => parseDeck({ ...validDeck(), cards: [card] }))
      .toThrowError(DeckFormatError, 'cards[0].bowling.average must be null when wickets is 0');
  });

  it('rejects a fake 0 economy rate for a player who never bowled', () => {
    const card = validCard();
    card['bowling'] = { overs: 0, runs: 0, wickets: 0, bestBowling: '0/0', average: null, economyRate: 0 };
    expect(() => parseDeck({ ...validDeck(), cards: [card] }))
      .toThrowError(DeckFormatError, 'cards[0].bowling.economyRate must be null when overs is 0');
  });

  it('rejects a card whose sport differs from the deck', () => {
    const card = { ...validCard(), sport: 'football' };
    const raw = { ...validDeck(), cards: [card] };
    expect(() => parseDeck(raw)).toThrowError(DeckFormatError, 'cards[0].sport must be one of: cricket');
  });

  it('rejects duplicate card ids', () => {
    const raw = { ...validDeck(), cards: [validCard('same'), validCard('same')] };
    expect(() => parseDeck(raw)).toThrowError(DeckFormatError, 'duplicate card id "same"');
  });
});
