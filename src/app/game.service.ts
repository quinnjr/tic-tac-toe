import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GameState {
  board: (string | null)[];
  currentPlayer: 'X' | 'O';
  gameOver: boolean;
  winner: string | null;
  moveHistory: Array<{
    player: 'X' | 'O';
    position: number;
    timestamp: number;
  }>;
  gameMode: 'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai';
  aiPerformance?: {
    algorithm: 'minimax' | 'alpha-beta';
    nodesExplored: number;
    executionTime: number;
    alphaBetaPruningTime: number;
    minimaxDecisionTime: number;
    bestMove: number;
  };
  playerXControl: 'human' | 'ai';
  playerOControl: 'human' | 'ai';
  playerXAlgorithm: 'minimax' | 'alpha-beta';
  playerOAlgorithm: 'minimax' | 'alpha-beta';
}

export interface GameStats {
  totalMoves: number;
  xMoves: number;
  oMoves: number;
  gameMode: 'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai';
  aiPerformance?: {
    algorithm: 'minimax' | 'alpha-beta';
    nodesExplored: number;
    executionTime: number;
    alphaBetaPruningTime: number;
    minimaxDecisionTime: number;
    bestMove: number;
  };
}

export interface AlgorithmComparison {
  minimax: {
    algorithm: 'minimax';
    nodesExplored: number;
    executionTime: number;
    bestMove: number;
  };
  alphaBeta: {
    algorithm: 'alpha-beta';
    nodesExplored: number;
    executionTime: number;
    bestMove: number;
  };
  improvement: {
    nodesReduced: number;
    timeReduced: number;
    percentageImprovement: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly apiUrl = '/api/game';

  constructor(private readonly http: HttpClient) {}

  public getGameState(): Observable<GameState> {
    return this.http.get<GameState>(`${this.apiUrl}/state`);
  }

  public setGameMode(mode: 'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai'): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/mode`, { mode });
  }

  public switchPlayerControl(player: 'X' | 'O', control: 'human' | 'ai'): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/switch-control`, { player, control });
  }

  public setPlayerAlgorithm(player: 'X' | 'O', algorithm: 'minimax' | 'alpha-beta'): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/set-algorithm`, { player, algorithm });
  }

  public makeAIMove(): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/ai-move`, {});
  }

  public makeMove(position: number): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/move`, { position });
  }

  public resetGame(): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/reset`, {});
  }

  public getGameHistory(): Observable<Array<{
    player: 'X' | 'O';
    position: number;
    timestamp: number;
  }>> {
    return this.http.get<Array<{
      player: 'X' | 'O';
      position: number;
      timestamp: number;
    }>>(`${this.apiUrl}/history`);
  }

  public getGameStats(): Observable<GameStats> {
    return this.http.get<GameStats>(`${this.apiUrl}/stats`);
  }

  public compareAlgorithms(): Observable<AlgorithmComparison> {
    return this.http.post<AlgorithmComparison>(`${this.apiUrl}/compare-algorithms`, {});
  }
}
