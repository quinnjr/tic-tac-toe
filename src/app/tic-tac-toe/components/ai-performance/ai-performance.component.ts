import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from '../../../game.service';

export interface AIPerformance {
  algorithm: 'minimax' | 'alpha-beta';
  nodesExplored: number;
  executionTime: number;
  bestMove: number;
  depth: number;
}

@Component({
  selector: 'app-ai-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-performance.component.html',
  styleUrl: './ai-performance.component.scss'
})
export class AIPerformanceComponent {
  @Input() public gameState: GameState | null = null;
  @Input() public aiPerformance: AIPerformance | null = null;

  public getAlgorithmDisplayName(): string {
    if (!this.aiPerformance) return '';
    return this.aiPerformance.algorithm === 'alpha-beta' ? 'Alpha-Beta Pruning' : 'Minimax';
  }

  public getPerformanceColor(): string {
    if (!this.aiPerformance) return 'green';
    return this.aiPerformance.algorithm === 'alpha-beta' ? 'blue' : 'red';
  }

  public getEfficiencyRating(): string {
    if (!this.aiPerformance) return 'Unknown';

    const { executionTime, nodesExplored } = this.aiPerformance;

    if (executionTime < 10 && nodesExplored < 50000) {
      return 'Excellent';
    } else if (executionTime < 50 && nodesExplored < 100000) {
      return 'Good';
    } else if (executionTime < 100 && nodesExplored < 200000) {
      return 'Fair';
    } else {
      return 'Slow';
    }
  }

  public formatNumber(num: number): string {
    return num.toLocaleString();
  }
}
