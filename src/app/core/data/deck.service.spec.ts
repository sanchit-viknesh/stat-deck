import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Deck } from '../models/deck.model';
import { DeckFormatError } from './deck.parser';
import { DeckService } from './deck.service';

const rawDeck = {
  sport: 'cricket',
  generatedAt: '2026-01-01T00:00:00Z',
  cards: [
    {
      id: 'test-bowler',
      name: 'Test Bowler',
      team: 'Testland',
      sport: 'cricket',
      batting: {
        matches: 50, innings: 20, notOuts: 8, runs: 120, highestScore: 21,
        average: 10, ballsFaced: 200, strikeRate: 60, hundreds: 0, fifties: 0,
      },
      bowling: { overs: 400, runs: 1800, wickets: 90, bestBowling: '5/20', average: 20, economyRate: 4.5 },
    },
  ],
};

describe('DeckService', () => {
  let service: DeckService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DeckService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches the deck file for the sport and returns the parsed deck', () => {
    let result: Deck | undefined;
    service.loadDeck('cricket').subscribe((deck) => (result = deck));

    http.expectOne('data/deck.cricket.json').flush(rawDeck);

    expect(result?.cards[0].bowling.wickets).toBe(90);
  });

  it('errors with DeckFormatError when the file is malformed', () => {
    let error: unknown;
    service.loadDeck('cricket').subscribe({ error: (e) => (error = e) });

    http.expectOne('data/deck.cricket.json').flush({ ...rawDeck, cards: [] });

    expect(error).toBeInstanceOf(DeckFormatError);
  });

  it('passes HTTP failures through to the caller', () => {
    let status: number | undefined;
    service.loadDeck('cricket').subscribe({ error: (e) => (status = e.status) });

    http.expectOne('data/deck.cricket.json').flush('missing', { status: 404, statusText: 'Not Found' });

    expect(status).toBe(404);
  });
});
