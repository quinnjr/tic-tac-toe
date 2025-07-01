import { Injectable, signal, computed, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TimerState {
  currentPlayer: 'X' | 'O';
  currentPlayerTime: number;
  player1TotalTime: number;
  player2TotalTime: number;
  isRunning: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  // Signal-based state
  private readonly _currentPlayer = signal<'X' | 'O'>('X');
  private readonly _currentPlayerTime = signal(0);
  private readonly _player1TotalTime = signal(0);
  private readonly _player2TotalTime = signal(0);
  private readonly _isRunning = signal(false);
  private readonly _startTime = signal<number | null>(null);
  private readonly _timerInterval = signal<any>(null);

  // Computed signal for the complete timer state
  public readonly timerState = computed<TimerState>(() => ({
    currentPlayer: this._currentPlayer(),
    currentPlayerTime: this._currentPlayerTime(),
    player1TotalTime: this._player1TotalTime(),
    player2TotalTime: this._player2TotalTime(),
    isRunning: this._isRunning()
  }));

  // Legacy Observable for backward compatibility
  private readonly _timerState$ = new BehaviorSubject<TimerState>(this.timerState());

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Effect to update the legacy observable when signals change
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        this._timerState$.next(this.timerState());
      }
    });

    // Effect to handle timer updates
    effect(() => {
      if (this._isRunning() && isPlatformBrowser(this.platformId)) {
        const interval = setInterval(() => {
          this.updateCurrentPlayerTime();
        }, 100);

        this._timerInterval.set(interval);

        // Cleanup function
        return () => {
          clearInterval(interval);
        };
      } else {
        const interval = this._timerInterval();
        if (interval) {
          clearInterval(interval);
          this._timerInterval.set(null);
        }
        return undefined; // Explicit return for consistency
      }
    });
  }

  // Legacy getter for backward compatibility
  public get timerState$(): Observable<TimerState> {
    return this._timerState$.asObservable();
  }

  // Modern signal getters
  public get currentPlayer() {
    return this._currentPlayer();
  }

  public get currentPlayerTime() {
    return this._currentPlayerTime();
  }

  public get player1TotalTime() {
    return this._player1TotalTime();
  }

  public get player2TotalTime() {
    return this._player2TotalTime();
  }

  public get isRunning() {
    return this._isRunning();
  }

  public startTimer(player: 'X' | 'O'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Stop current timer and save time
    if (this._isRunning()) {
      this.stopTimer();
    }

    this._currentPlayer.set(player);
    this._currentPlayerTime.set(0);
    this._startTime.set(Date.now());
    this._isRunning.set(true);
  }

  public stopTimer(): void {
    if (!isPlatformBrowser(this.platformId) || !this._isRunning()) {
      return;
    }

    // Add current session time to total
    const currentTime = this._currentPlayerTime();
    if (this._currentPlayer() === 'X') {
      this._player1TotalTime.update(total => total + currentTime);
    } else {
      this._player2TotalTime.update(total => total + currentTime);
    }

    this._isRunning.set(false);
    this._currentPlayerTime.set(0);
    this._startTime.set(null);
  }

  public resetTimer(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this._isRunning.set(false);
    this._currentPlayerTime.set(0);
    this._player1TotalTime.set(0);
    this._player2TotalTime.set(0);
    this._startTime.set(null);

    // Clear any existing interval
    const interval = this._timerInterval();
    if (interval && isPlatformBrowser(this.platformId)) {
      clearInterval(interval);
      this._timerInterval.set(null);
    }
  }

  private updateCurrentPlayerTime(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const startTime = this._startTime();
    if (startTime && this._isRunning()) {
      const elapsed = Date.now() - startTime;
      this._currentPlayerTime.set(Math.floor(elapsed / 100) * 100); // Round to nearest 100ms
    }
  }

  public formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = Math.floor((milliseconds % 1000) / 100);

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs}`;
    } else {
      return `${remainingSeconds}.${remainingMs}s`;
    }
  }
}
