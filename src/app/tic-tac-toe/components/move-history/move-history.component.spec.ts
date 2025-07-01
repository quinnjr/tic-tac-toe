import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoveHistoryComponent } from './move-history.component';
import { GameState } from '../../../game.service';

describe('MoveHistoryComponent', () => {
  let component: MoveHistoryComponent;
  let fixture: ComponentFixture<MoveHistoryComponent>;

  const mockGameState: GameState = {
    board: ['X', 'O', null, 'X', null, null, null, null, null],
    currentPlayer: 'O',
    gameOver: false,
    winner: null,
    moveHistory: [
      { player: 'X', position: 0, timestamp: 1634567890000 },
      { player: 'O', position: 1, timestamp: 1634567891000 },
      { player: 'X', position: 3, timestamp: 1634567892000 }
    ],
    gameMode: 'human-vs-ai',
    playerXControl: 'human',
    playerOControl: 'ai',
    playerXAlgorithm: 'alpha-beta',
    playerOAlgorithm: 'minimax'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveHistoryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MoveHistoryComponent);
    component = fixture.componentInstance;
    component.gameState = mockGameState;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct moves from game state', () => {
    const moves = component.getMoves();
    expect(moves.length).toBe(3);
    expect(moves[0].player).toBe('X');
    expect(moves[0].position).toBe(0);
  });

  it('should return empty array when no game state', () => {
    component.gameState = null;
    expect(component.getMoves()).toEqual([]);
  });

  it('should return correct player display name for human', () => {
    expect(component.getPlayerDisplayName('X')).toBe('Human');
  });

  it('should return correct player display name for AI', () => {
    expect(component.getPlayerDisplayName('O')).toBe('AI (Minimax)');
  });

  it('should return correct position display name', () => {
    expect(component.getPositionDisplayName(0)).toBe('Row 1, Col 1');
    expect(component.getPositionDisplayName(4)).toBe('Row 2, Col 2');
    expect(component.getPositionDisplayName(8)).toBe('Row 3, Col 3');
  });

  it('should return correct CSS class for X player', () => {
    expect(component.getMovePlayerClass('X')).toBe('text-red-400');
  });

  it('should return correct CSS class for O player', () => {
    expect(component.getMovePlayerClass('O')).toBe('text-blue-400');
  });

  it('should return true when there are moves', () => {
    expect(component.hasAnyMoves()).toBe(true);
  });

  it('should return false when there are no moves', () => {
    component.gameState!.moveHistory = [];
    expect(component.hasAnyMoves()).toBe(false);
  });

  it('should handle null game state gracefully', () => {
    component.gameState = null;
    expect(component.getPlayerDisplayName('X')).toBe('X');
    expect(component.hasAnyMoves()).toBe(false);
  });
});
