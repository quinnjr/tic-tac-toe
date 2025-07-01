import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoveTimerComponent } from './move-timer.component';
import { TimerState } from '../../../timer.service';
import { GameState } from '../../../game.service';

describe('MoveTimerComponent', () => {
  let component: MoveTimerComponent;
  let fixture: ComponentFixture<MoveTimerComponent>;

  const mockTimerState: TimerState = {
    currentPlayer: 'X',
    currentPlayerTime: 45,
    player1TotalTime: 120,
    player2TotalTime: 95,
    isRunning: true
  };

  const mockGameState: GameState = {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: 'X',
    gameOver: false,
    winner: null,
    moveHistory: [],
    gameMode: 'human-vs-ai',
    playerXControl: 'human',
    playerOControl: 'ai',
    playerXAlgorithm: 'alpha-beta',
    playerOAlgorithm: 'minimax'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveTimerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MoveTimerComponent);
    component = fixture.componentInstance;
    component.timerState = mockTimerState;
    component.gameState = mockGameState;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct player display name for human player', () => {
    const displayName = component.getPlayerDisplayName('X');
    expect(displayName).toBe('Human');
  });

  it('should return correct player display name for AI player with minimax', () => {
    const displayName = component.getPlayerDisplayName('O');
    expect(displayName).toBe('AI (Minimax)');
  });

  it('should return correct player display name for AI player with alpha-beta', () => {
    component.gameState!.playerOAlgorithm = 'alpha-beta';
    const displayName = component.getPlayerDisplayName('O');
    expect(displayName).toBe('AI (Alpha-Beta)');
  });

  it('should format time correctly for minutes and seconds', () => {
    expect(component.formatTime(0)).toBe('0:00');
    expect(component.formatTime(30000)).toBe('0:30');
    expect(component.formatTime(60000)).toBe('1:00');
    expect(component.formatTime(125000)).toBe('2:05');
  });

  it('should handle null game state gracefully', () => {
    component.gameState = null;
    expect(component.getPlayerDisplayName('X')).toBe('X');
    expect(component.getPlayerDisplayName('O')).toBe('O');
  });

  it('should display timer state correctly in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const currentTimeDisplay = compiled.querySelector('.text-yellow-400');
    expect(currentTimeDisplay?.textContent?.trim()).toBe('0:00');
  });
});
