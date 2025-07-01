import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmComparison } from '../../../game.service';

@Component({
  selector: 'app-algorithm-comparison',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './algorithm-comparison.component.html',
  styleUrl: './algorithm-comparison.component.scss'
})
export class AlgorithmComparisonComponent {
  @Input() public comparisonData: AlgorithmComparison | null = null;
  @Input() public isLoading: boolean = false;
  @Output() public runComparison = new EventEmitter<void>();

  public onRunComparison(): void {
    this.runComparison.emit();
  }

  public formatNumber(num: number): string {
    return num.toLocaleString();
  }

  public formatTime(ms: number): string {
    return `${ms.toFixed(2)}ms`;
  }

  public getImprovementColor(percentage: number): string {
    if (percentage >= 50) return 'text-green-400';
    if (percentage >= 25) return 'text-yellow-400';
    if (percentage > 0) return 'text-blue-400';
    return 'text-red-400';
  }

  public getEfficiencyRating(executionTime: number, nodesExplored: number): string {
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

  public hasValidComparison(): boolean {
    return this.comparisonData !== null
           && this.comparisonData.minimax !== undefined
           && this.comparisonData.alphaBeta !== undefined;
  }
}
