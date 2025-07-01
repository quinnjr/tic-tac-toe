import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from '../../../game.service';

export interface MoveRecord {
  player: 'X' | 'O';
  position: number;
  timestamp: number;
}

@Component({
  selector: 'app-move-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './move-history.component.html',
  styleUrl: './move-history.component.scss'
})
export class MoveHistoryComponent {
  @Input() public gameState: GameState | null = null;

  public getMoves(): MoveRecord[] {
    if (!this.gameState?.moveHistory) return [];
    return this.gameState.moveHistory;
  }

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

  public getPositionDisplayName(position: number): string {
    const row = Math.floor(position / 3) + 1;
    const col = (position % 3) + 1;
    return `Row ${row}, Col ${col}`;
  }

  public getMovePlayerClass(player: 'X' | 'O'): string {
    return player === 'X' ? 'text-red-400' : 'text-blue-400';
  }

  public hasAnyMoves(): boolean {
    return this.getMoves().length > 0;
  }
}
