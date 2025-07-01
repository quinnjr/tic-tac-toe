import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from '../../../game.service';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent {
  @Input() public gameState: GameState | null = null;
  @Input() public lastMovePosition: number | null = null;

  @Output() public moveSelected = new EventEmitter<number>();

  public makeMove(position: number): void {
    if (!this.gameState || this.gameState.gameOver || this.gameState.board[position] !== null) {
      return;
    }

    // Check if current player is AI-controlled
    const currentPlayerIsAI = (this.gameState.currentPlayer === 'X' && this.gameState.playerXControl === 'ai') ||
                              (this.gameState.currentPlayer === 'O' && this.gameState.playerOControl === 'ai');

    if (currentPlayerIsAI) {
      return; // Don't allow manual moves for AI players
    }

    this.moveSelected.emit(position);
  }

  public isRecentMove(position: number): boolean {
    // Don't show blinking effect if the game is over
    if (this.gameState?.gameOver) {
      return false;
    }
    return this.lastMovePosition === position;
  }

  public getButtonClass(index: number, cell: string | null): string {
    let classes = 'aspect-square text-6xl font-bold rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ';

    if (this.gameState?.gameOver || cell !== null) {
      classes += 'cursor-not-allowed ';
    } else {
      classes += 'cursor-pointer hover:bg-white/10 ';
    }

    if (cell === null) {
      classes += 'bg-white/5 border-white/30 hover:border-white/50 ';
    } else {
      classes += 'bg-white/10 border-white/40 ';
    }

    if (this.gameState?.gameOver && this.isWinningPosition(index)) {
      classes += 'bg-green-500/20 border-green-400/50 ';
    }

    return classes;
  }

  private isWinningPosition(position: number): boolean {
    if (!this.gameState || !this.gameState.winner || this.gameState.winner === 'Draw') {
      return false;
    }

    const board = this.gameState.board;
    const winningLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const line of winningLines) {
      if (line.every(pos => board[pos] === this.gameState?.winner) && line.includes(position)) {
        return true;
      }
    }

    return false;
  }
}
