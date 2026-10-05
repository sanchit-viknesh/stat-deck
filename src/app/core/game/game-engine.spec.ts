import { BowlingStats, PlayerCard } from '../models/card.model';
import { STAT_DEFINITIONS, StatDefinition } from '../models/stat-key.model';
import { compareCards, getStatValue, isStatAvailable } from './game-engine';

function stat(label: string): StatDefinition {
  const found = STAT_DEFINITIONS.find((s) => s.label === label);
  if (!found) throw new Error(`no stat labelled ${label}`);
  return found;
}

const runs = stat('Runs');
const wickets = stat('Wickets');
const bowlingAverage = stat('Bowling Average');
const economy = stat('Economy Rate');

function card(id: string, runsScored: number, bowling: BowlingStats): PlayerCard {
  return {
    id,
    name: id,
    team: 'Testland',
    sport: 'cricket',
    batting: {
      matches: 100, innings: 90, notOuts: 10, runs: runsScored, highestScore: 120,
      average: 40, ballsFaced: 4000, strikeRate: 80, hundreds: 5, fifties: 20,
    },
    bowling,
  };
}

const neverBowled: BowlingStats = { overs: 0, runs: 0, wickets: 0, bestBowling: '0/0', average: null, economyRate: null };
const wicketless: BowlingStats = { overs: 3, runs: 17, wickets: 0, bestBowling: '0/5', average: null, economyRate: 5.67 };
const strikeBowler: BowlingStats = { overs: 700, runs: 3200, wickets: 140, bestBowling: '6/19', average: 22.86, economyRate: 4.57 };
const partTimer: BowlingStats = { overs: 20, runs: 120, wickets: 4, bestBowling: '1/13', average: 30, economyRate: 6 };

const batter = card('batter', 9000, neverBowled);
const occasional = card('occasional', 6000, wicketless);
const bowler = card('bowler', 150, strikeBowler);
const allrounder = card('allrounder', 4000, partTimer);

describe('getStatValue', () => {
  it('reads from the block the stat belongs to', () => {
    expect(getStatValue(batter, runs)).toBe(9000);
    expect(getStatValue(bowler, wickets)).toBe(140);
  });

  it('returns null for a stat that cannot be calculated', () => {
    expect(getStatValue(occasional, bowlingAverage)).toBeNull();
  });
});

describe('isStatAvailable', () => {
  it('locks every bowling stat for a player who never bowled, including wickets', () => {
    expect(isStatAvailable(batter, wickets)).toBeFalse();
    expect(isStatAvailable(batter, bowlingAverage)).toBeFalse();
    expect(isStatAvailable(batter, economy)).toBeFalse();
  });

  it('allows a real 0 wickets from someone who did bowl', () => {
    expect(isStatAvailable(occasional, wickets)).toBeTrue();
    expect(isStatAvailable(occasional, economy)).toBeTrue();
  });

  it('locks bowling average when no wickets were taken', () => {
    expect(isStatAvailable(occasional, bowlingAverage)).toBeFalse();
  });

  it('allows batting stats for everyone', () => {
    expect(isStatAvailable(bowler, runs)).toBeTrue();
  });
});

describe('compareCards', () => {
  it('higher wins when lowerIsBetter is false', () => {
    expect(compareCards(batter, bowler, runs)).toBe('A');
    expect(compareCards(bowler, batter, runs)).toBe('B');
  });

  it('lower wins when lowerIsBetter is true', () => {
    expect(compareCards(bowler, allrounder, bowlingAverage)).toBe('A');
    expect(compareCards(allrounder, bowler, economy)).toBe('B');
  });

  it('returns draw on equal values', () => {
    expect(compareCards(batter, batter, runs)).toBe('draw');
  });

  it('throws instead of guessing when a stat is unavailable', () => {
    expect(() => compareCards(occasional, bowler, bowlingAverage)).toThrowError(/unavailable/);
  });
});
