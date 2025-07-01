import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GameService, GameState, AlgorithmComparison } from '../game.service';
import { TimerService, TimerState } from '../timer.service';

// Import the smaller components
import { GameBoardComponent } from './components/game-board/game-board.component';
import { PlayerControlsComponent } from './components/player-controls/player-controls.component';
import { MoveTimerComponent } from './components/move-timer/move-timer.component';
import { GameStatsComponent } from './components/game-stats/game-stats.component';
import { AlgorithmComparisonComponent } from './components/algorithm-comparison/algorithm-comparison.component';

@Component({
  selector: 'app-tic-tac-toe',
  standalone: true,
  imports: [
    CommonModule,
    GameBoardComponent,
    PlayerControlsComponent,
    MoveTimerComponent,
    GameStatsComponent,
    AlgorithmComparisonComponent
  ],
  templateUrl: './tic-tac-toe.component.html',
  styleUrl: './tic-tac-toe.component.scss'
})
export class TicTacToeComponent implements OnInit, OnDestroy {
  // Traditional Properties
  public gameState: GameState | null = null;
  public timerState: TimerState | null = null;
  public algorithmComparison: AlgorithmComparison | null = null;
  public showComparison = false;
  public showHelpModal = false;
  public isLoading = true;
  private aiGameInterval: any = null;
  private aiGameLoopStarting = false;
  public lastMovePosition: number | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly gameService: GameService,
    public readonly timerService: TimerService
  ) {}

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGameState();
      this.initializeTimerState();
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.aiGameInterval) {
      clearInterval(this.aiGameInterval);
      this.aiGameInterval = null;
    }
    this.aiGameLoopStarting = false;
  }

      // Game mode is now automatically determined by player controls - no manual setting needed

  // Player Control Management
  public switchPlayerControl(event: {player: 'X' | 'O', control: 'human' | 'ai'}): void {
    this.gameService.switchPlayerControl(event.player, event.control).subscribe({
      next: () => this.loadGameState(),
      error: (error: any) => console.error('Error switching player control:', error)
    });
  }

  public setPlayerAlgorithm(event: {player: 'X' | 'O', algorithm: 'minimax' | 'alpha-beta'}): void {
    this.gameService.setPlayerAlgorithm(event.player, event.algorithm).subscribe({
      next: () => this.loadGameState(),
      error: (error: any) => console.error('Error setting player algorithm:', error)
    });
  }

    // Move Management
  public makeMove(position: number): void {
    this.gameService.makeMove(position).subscribe({
      next: (state: GameState) => {
        this.gameState = state;
        this.lastMovePosition = position;

        // Start timer for next player if game is ongoing
        if (!state.gameOver && isPlatformBrowser(this.platformId)) {
          this.timerService.startTimer(state.currentPlayer);
        }

        // Auto-handle AI moves if needed (but not for AI vs AI, that's handled separately)
        if (state.gameMode !== 'ai-vs-ai' && this.isCurrentPlayerAI() && !state.gameOver) {
          setTimeout(() => this.makeAIMove(), 500);
        }
      },
      error: (error: any) => console.error('Error making move:', error)
    });
  }

  public makeAIMove(): void {
    if (!this.gameState || this.gameState.gameOver) {
      return;
    }

            this.gameService.makeAIMove().subscribe({
      next: (response: any) => {
        // The response IS the gameState, not wrapped in a gameState property
        this.gameState = response;
        // The AI move position is stored in aiPerformance.bestMove
        this.lastMovePosition = response.aiPerformance?.bestMove ?? null;

        // Start timer for next player if game is ongoing
        if (this.gameState && !this.gameState.gameOver && isPlatformBrowser(this.platformId)) {
          this.timerService.startTimer(this.gameState.currentPlayer);
        }
      },
      error: (error: any) => {
        console.error('Error making AI move:', error);
        // Stop AI game loop on error to prevent infinite error loops
        if (this.aiGameInterval) {
          clearInterval(this.aiGameInterval);
          this.aiGameInterval = null;
        }
      }
    });
  }

  // Algorithm Comparison
  public runAlgorithmComparison(): void {
    if (!this.gameState) return;

    this.showComparison = true;
    this.gameService.compareAlgorithms().subscribe({
      next: (comparison: AlgorithmComparison) => {
        this.algorithmComparison = comparison;
      },
      error: (error: any) => {
        console.error('Error running algorithm comparison:', error);
        this.showComparison = false;
      }
    });
  }

  // Game Management
  public resetGame(): void {
    // Clear any existing AI game loop first
    if (this.aiGameInterval) {
      clearInterval(this.aiGameInterval);
      this.aiGameInterval = null;
    }
    this.aiGameLoopStarting = false;

    this.gameService.resetGame().subscribe({
      next: () => {
        this.loadGameState();
        this.lastMovePosition = null;

        // Reset timer when game resets
        if (isPlatformBrowser(this.platformId)) {
          this.timerService.resetTimer();
        }
      },
      error: (error: any) => console.error('Error resetting game:', error)
    });
  }

  // Helper Methods
  public getCurrentPlayerName(): string {
    if (!this.gameState) return '';

    const player = this.gameState.currentPlayer;
    const control = player === 'X' ? this.gameState.playerXControl : this.gameState.playerOControl;
    const algorithm = player === 'X' ? this.gameState.playerXAlgorithm : this.gameState.playerOAlgorithm;

    if (control === 'human') {
      return `Player ${player} (Human)`;
    } else {
      return `Player ${player} (AI - ${algorithm === 'alpha-beta' ? 'Alpha-Beta' : 'Minimax'})`;
    }
  }

  public getGameResult(): string {
    if (!this.gameState) return '';

    if (this.gameState.winner === 'Draw') {
      return "It's a Draw!";
    } else if (this.gameState.winner) {
      return `Player ${this.gameState.winner} Wins!`;
    }

    return '';
  }

  public isCurrentPlayerAI(): boolean {
    if (!this.gameState) return false;

    return (this.gameState.currentPlayer === 'X' && this.gameState.playerXControl === 'ai') ||
           (this.gameState.currentPlayer === 'O' && this.gameState.playerOControl === 'ai');
  }

  public showHelpButton(): void {
    this.showHelpModal = true;
  }

  public closeHelpModal(): void {
    this.showHelpModal = false;
  }

  // Private Methods
  private loadGameState(): void {
    this.gameService.getGameState().subscribe({
      next: (state: GameState) => {
        this.gameState = state;
        this.isLoading = false;

        // Start timer for current player if game is ongoing
        if (!state.gameOver && isPlatformBrowser(this.platformId)) {
          this.timerService.startTimer(state.currentPlayer);
        }

        // Start AI vs AI battle if in AI vs AI mode and game is ongoing
        // Add a longer delay to ensure all components are properly initialized
        if (state.gameMode === 'ai-vs-ai' && !state.gameOver && isPlatformBrowser(this.platformId)) {
          // Use a longer timeout to ensure page is fully rendered
          setTimeout(() => {
            if (this.gameState && this.gameState.gameMode === 'ai-vs-ai' && !this.gameState.gameOver) {
              this.startAIGameLoop();
            }
          }, 2000);
        }
      },
      error: (error: any) => {
        console.error('Error loading game state:', error);
        this.isLoading = false;
      }
    });
  }

  private initializeTimerState(): void {
    // Subscribe to timer state from the service
    this.timerService.timerState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.timerState = state;
    });
  }



      private startAIGameLoop(): void {
    // Don't start if game is over or not in AI vs AI mode
    if (!this.gameState || this.gameState.gameOver || this.gameState.gameMode !== 'ai-vs-ai') {
      return;
    }

    // Don't start if already starting
    if (this.aiGameLoopStarting || this.aiGameInterval) {
      return;
    }

    this.aiGameLoopStarting = true;

    // Clear any existing interval
    if (this.aiGameInterval) {
      clearInterval(this.aiGameInterval);
      this.aiGameInterval = null;
    }

    try {
      // Start with the first move immediately, then set up interval
      this.makeAIMove();
      this.aiGameLoopStarting = false;

      // Set up interval for subsequent moves with a delay to avoid race conditions
      setTimeout(() => {
        this.aiGameInterval = setInterval(() => {
          try {
            if (this.gameState && !this.gameState.gameOver && this.gameState.gameMode === 'ai-vs-ai') {
              this.makeAIMove();
            } else {
              if (this.aiGameInterval) {
                clearInterval(this.aiGameInterval);
                this.aiGameInterval = null;
              }
            }
          } catch (error) {
            console.error('Error in AI game loop interval:', error);
            if (this.aiGameInterval) {
              clearInterval(this.aiGameInterval);
              this.aiGameInterval = null;
            }
          }
        }, 2000); // 2 seconds between moves to avoid race conditions
      }, 1000); // Wait 1 second after first move before starting interval
    } catch (error) {
      console.error('Error starting AI game loop:', error);
      this.aiGameLoopStarting = false;
    }
  }
}
