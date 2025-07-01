import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerState } from '../../../timer.service';
import { GameState } from '../../../game.service';

@Component({
  selector: 'app-move-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './move-timer.component.html',
  styleUrl: './move-timer.component.scss'
})
export class MoveTimerComponent {
  @Input() public timerState: TimerState | null = null;
  @Input() public gameState: GameState | null = null;

  public getPlayerDisplayName(player: 'X' | 'O'): string {
    if (!this.gameState) return player;

    const control = player === 'X' ? this.gameState.playerXControl : this.gameState.playerOControl;
    const algorithm = player === 'X' ? this.gameState.playerXAlgorithm : this.gameState.playerOAlgorithm;

    if (control === 'human') {
      return 'Human';
    } else {
      return `AI (${algorithm === 'alpha-beta' ? 'Alpha-Beta' : 'Minimax'})`;
    }
  }

  public formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  public isCurrentPlayerHuman(): boolean {
    if (!this.gameState) return false;
    const currentPlayer = this.gameState.currentPlayer;
    const control = currentPlayer === 'X' ? this.gameState.playerXControl : this.gameState.playerOControl;
    return control === 'human';
  }

  public isAIPlayer(player: 'X' | 'O'): boolean {
    if (!this.gameState) return false;
    const control = player === 'X' ? this.gameState.playerXControl : this.gameState.playerOControl;
    return control === 'ai';
  }

  public getLastPlayer(): 'X' | 'O' {
    if (!this.gameState) return 'X';
    // The last player is the opposite of the current player (since turn switched after move)
    return this.gameState.currentPlayer === 'X' ? 'O' : 'X';
  }
}
