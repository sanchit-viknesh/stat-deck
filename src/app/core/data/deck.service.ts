import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Sport } from '../models/card.model';
import { Deck } from '../models/deck.model';
import { parseDeck } from './deck.parser';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private readonly http = inject(HttpClient);

  loadDeck(sport: Sport): Observable<Deck> {
    return this.http.get<unknown>(`data/deck.${sport}.json`).pipe(map(parseDeck));
  }
}
