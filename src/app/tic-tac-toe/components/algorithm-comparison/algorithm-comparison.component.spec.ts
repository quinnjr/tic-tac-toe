import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlgorithmComparisonComponent } from './algorithm-comparison.component';
import { AlgorithmComparison } from '../../../game.service';

describe('AlgorithmComparisonComponent', () => {
  let component: AlgorithmComparisonComponent;
  let fixture: ComponentFixture<AlgorithmComparisonComponent>;

  const mockComparisonData: AlgorithmComparison = {
    minimax: {
      algorithm: 'minimax',
      nodesExplored: 100000,
      executionTime: 50.5,
      bestMove: 4
    },
    alphaBeta: {
      algorithm: 'alpha-beta',
      nodesExplored: 45000,
      executionTime: 22.3,
      bestMove: 4
    },
    improvement: {
      nodesReduced: 55000,
      timeReduced: 28.2,
      percentageImprovement: 55.8
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlgorithmComparisonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AlgorithmComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit runComparison event when button is clicked', () => {
    spyOn(component.runComparison, 'emit');
    component.onRunComparison();
    expect(component.runComparison.emit).toHaveBeenCalled();
  });

  it('should format numbers with locale formatting', () => {
    expect(component.formatNumber(123456)).toBe('123,456');
    expect(component.formatNumber(1000)).toBe('1,000');
  });

  it('should format time with decimal places', () => {
    expect(component.formatTime(50.567)).toBe('50.57ms');
    expect(component.formatTime(10)).toBe('10.00ms');
  });

  it('should return correct improvement color for high percentage', () => {
    expect(component.getImprovementColor(75)).toBe('text-green-400');
  });

  it('should return correct improvement color for medium percentage', () => {
    expect(component.getImprovementColor(35)).toBe('text-yellow-400');
  });

  it('should return correct improvement color for low percentage', () => {
    expect(component.getImprovementColor(15)).toBe('text-blue-400');
  });

  it('should return correct improvement color for negative percentage', () => {
    expect(component.getImprovementColor(-5)).toBe('text-red-400');
  });

  it('should return excellent efficiency rating for fast performance', () => {
    expect(component.getEfficiencyRating(5, 30000)).toBe('Excellent');
  });

  it('should return good efficiency rating for moderate performance', () => {
    expect(component.getEfficiencyRating(30, 80000)).toBe('Good');
  });

  it('should return slow efficiency rating for poor performance', () => {
    expect(component.getEfficiencyRating(150, 300000)).toBe('Slow');
  });

  it('should return true for valid comparison data', () => {
    component.comparisonData = mockComparisonData;
    expect(component.hasValidComparison()).toBe(true);
  });

  it('should return false for null comparison data', () => {
    component.comparisonData = null;
    expect(component.hasValidComparison()).toBe(false);
  });

  it('should disable button when loading', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });
});
