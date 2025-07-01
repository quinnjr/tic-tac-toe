import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from '../../../game.service';

@Component({
  selector: 'app-player-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-controls.component.html',
  styleUrl: './player-controls.component.scss'
})
export class PlayerControlsComponent {
  @Input() public gameState: GameState | null = null;

  @Output() public playerControlSwitched = new EventEmitter<{player: 'X' | 'O', control: 'human' | 'ai'}>();
  @Output() public playerAlgorithmChanged = new EventEmitter<{player: 'X' | 'O', algorithm: 'minimax' | 'alpha-beta'}>();
  @Output() public aiMoveRequested = new EventEmitter<void>();

  public switchPlayerControl(player: 'X' | 'O', control: 'human' | 'ai'): void {
    this.playerControlSwitched.emit({ player, control });
  }

  public setPlayerAlgorithm(player: 'X' | 'O', algorithm: 'minimax' | 'alpha-beta'): void {
    this.playerAlgorithmChanged.emit({ player, algorithm });
  }

  public makeAIMove(): void {
    this.aiMoveRequested.emit();
  }

  public isPlayerHuman(player: 'X' | 'O'): boolean {
    if (!this.gameState) return true;
    return player === 'X' ? this.gameState.playerXControl === 'human' : this.gameState.playerOControl === 'human';
  }

  public isPlayerAI(player: 'X' | 'O'): boolean {
    if (!this.gameState) return false;
    return player === 'X' ? this.gameState.playerXControl === 'ai' : this.gameState.playerOControl === 'ai';
  }

  public getPlayerAlgorithm(player: 'X' | 'O'): 'minimax' | 'alpha-beta' {
    if (!this.gameState) return 'alpha-beta';
    return player === 'X' ? this.gameState.playerXAlgorithm : this.gameState.playerOAlgorithm;
  }

  public canPlayerMakeMove(player: 'X' | 'O'): boolean {
    if (!this.gameState) return false;
    return this.isPlayerAI(player) && this.gameState.currentPlayer === player && !this.gameState.gameOver;
  }

  public getControlButtonClass(player: 'X' | 'O', control: 'human' | 'ai'): string {
    const baseClass = 'px-3 py-1 rounded text-sm font-medium transition-all duration-200 ';
    const isActive = (control === 'human' && this.isPlayerHuman(player)) || (control === 'ai' && this.isPlayerAI(player));

    if (isActive) {
      return baseClass + (player === 'X' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white');
    }

    return baseClass + 'bg-white/20 text-gray-300';
  }

  public getAlgorithmButtonClass(player: 'X' | 'O', algorithm: 'minimax' | 'alpha-beta'): string {
    const baseClass = 'px-3 py-1 rounded text-sm font-medium transition-all duration-200 ';
    const isActive = this.getPlayerAlgorithm(player) === algorithm;

    if (isActive) {
      return baseClass + (player === 'X' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white');
    }

    return baseClass + 'bg-white/20 text-gray-300';
  }
}
