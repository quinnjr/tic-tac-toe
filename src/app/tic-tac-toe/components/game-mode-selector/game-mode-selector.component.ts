import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from '../../../game.service';

@Component({
  selector: 'app-game-mode-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-mode-selector.component.html',
  styleUrl: './game-mode-selector.component.scss'
})
export class GameModeSelectorComponent {
  @Input() public gameState: GameState | null = null;

  @Output() public gameModeSelected = new EventEmitter<'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai'>();

  public setGameMode(mode: 'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai'): void {
    this.gameModeSelected.emit(mode);
  }

  public getModeButtonClass(mode: 'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai'): string {
    let baseClass = 'px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-white/20 ';

    if (this.gameState?.gameMode === mode) {
      switch (mode) {
        case 'human-vs-human':
          return baseClass + 'bg-blue-500 text-white';
        case 'human-vs-ai':
          return baseClass + 'bg-green-500 text-white';
        case 'ai-vs-ai':
          return baseClass + 'bg-purple-500 text-white';
      }
    }

    return baseClass + 'bg-white/20 text-gray-300 hover:bg-white/30';
  }
}
