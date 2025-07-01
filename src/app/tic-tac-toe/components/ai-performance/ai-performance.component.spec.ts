import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AIPerformanceComponent, AIPerformance } from './ai-performance.component';
import { GameState } from '../../../game.service';

describe('AIPerformanceComponent', () => {
  let component: AIPerformanceComponent;
  let fixture: ComponentFixture<AIPerformanceComponent>;

  const mockGameState: GameState = {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: 'X',
    gameOver: false,
    winner: null,
    moveHistory: [],
    gameMode: 'ai-vs-ai',
    playerXControl: 'ai',
    playerOControl: 'ai',
    playerXAlgorithm: 'alpha-beta',
    playerOAlgorithm: 'minimax'
  };

  const mockAIPerformance: AIPerformance = {
    algorithm: 'alpha-beta',
    nodesExplored: 45000,
    executionTime: 25.5,
    bestMove: 4,
    depth: 9
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIPerformanceComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AIPerformanceComponent);
    component = fixture.componentInstance;
    component.gameState = mockGameState;
    component.aiPerformance = mockAIPerformance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct algorithm display name for alpha-beta', () => {
    expect(component.getAlgorithmDisplayName()).toBe('Alpha-Beta Pruning');
  });

  it('should return correct algorithm display name for minimax', () => {
    component.aiPerformance!.algorithm = 'minimax';
    expect(component.getAlgorithmDisplayName()).toBe('Minimax');
  });

  it('should return correct performance color for alpha-beta', () => {
    expect(component.getPerformanceColor()).toBe('blue');
  });

  it('should return correct performance color for minimax', () => {
    component.aiPerformance!.algorithm = 'minimax';
    expect(component.getPerformanceColor()).toBe('red');
  });

  it('should return excellent efficiency rating for fast performance', () => {
    component.aiPerformance = {
      algorithm: 'alpha-beta',
      nodesExplored: 30000,
      executionTime: 5,
      bestMove: 4,
      depth: 9
    };
    expect(component.getEfficiencyRating()).toBe('Excellent');
  });

  it('should return good efficiency rating for moderate performance', () => {
    component.aiPerformance = {
      algorithm: 'alpha-beta',
      nodesExplored: 80000,
      executionTime: 30,
      bestMove: 4,
      depth: 9
    };
    expect(component.getEfficiencyRating()).toBe('Good');
  });

  it('should return slow efficiency rating for poor performance', () => {
    component.aiPerformance = {
      algorithm: 'minimax',
      nodesExplored: 300000,
      executionTime: 150,
      bestMove: 4,
      depth: 9
    };
    expect(component.getEfficiencyRating()).toBe('Slow');
  });

  it('should format numbers with locale formatting', () => {
    expect(component.formatNumber(123456)).toBe('123,456');
    expect(component.formatNumber(1000)).toBe('1,000');
  });

  it('should handle null aiPerformance gracefully', () => {
    component.aiPerformance = null;
    expect(component.getAlgorithmDisplayName()).toBe('');
    expect(component.getPerformanceColor()).toBe('green');
    expect(component.getEfficiencyRating()).toBe('Unknown');
  });
});
