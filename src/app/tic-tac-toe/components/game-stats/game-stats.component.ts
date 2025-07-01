import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from '../../../game.service';

@Component({
  selector: 'app-game-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-stats.component.html',
  styleUrl: './game-stats.component.scss'
})
export class GameStatsComponent {
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

  public getGameModeDisplay(): string {
    if (!this.gameState) return '';

    switch (this.gameState.gameMode) {
      case 'human-vs-human':
        return '👥 Human vs Human';
      case 'human-vs-ai':
        return '🤖 Human vs AI';
      case 'ai-vs-ai':
        return '🤖🤖 AI vs AI';
      default:
        return '';
    }
  }
}
