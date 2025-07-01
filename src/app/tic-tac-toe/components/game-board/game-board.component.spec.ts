import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameBoardComponent } from './game-board.component';
import { GameState } from '../../../game.service';

describe('GameBoardComponent', () => {
  let component: GameBoardComponent;
  let fixture: ComponentFixture<GameBoardComponent>;

  const mockGameState: GameState = {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: 'X',
    gameOver: false,
    winner: null,
    moveHistory: [],
    gameMode: 'human-vs-human',
    playerXControl: 'human',
    playerOControl: 'human',
    playerXAlgorithm: 'alpha-beta',
    playerOAlgorithm: 'minimax'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GameBoardComponent);
    component = fixture.componentInstance;
    component.gameState = mockGameState;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit moveSelected when a valid move is made', () => {
    spyOn(component.moveSelected, 'emit');

    component.makeMove(0);

    expect(component.moveSelected.emit).toHaveBeenCalledWith(0);
  });

  it('should not emit moveSelected when cell is already occupied', () => {
    spyOn(component.moveSelected, 'emit');
    component.gameState!.board[0] = 'X';

    component.makeMove(0);

    expect(component.moveSelected.emit).not.toHaveBeenCalled();
  });

  it('should not emit moveSelected when game is over', () => {
    spyOn(component.moveSelected, 'emit');
    component.gameState!.gameOver = true;

    component.makeMove(0);

    expect(component.moveSelected.emit).not.toHaveBeenCalled();
  });

  it('should not emit moveSelected when current player is AI', () => {
    spyOn(component.moveSelected, 'emit');
    component.gameState!.playerXControl = 'ai';

    component.makeMove(0);

    expect(component.moveSelected.emit).not.toHaveBeenCalled();
  });

  it('should identify recent move correctly', () => {
    component.lastMovePosition = 5;

    expect(component.isRecentMove(5)).toBe(true);
    expect(component.isRecentMove(3)).toBe(false);
  });

  it('should not show recent move when game is over', () => {
    component.lastMovePosition = 5;
    component.gameState!.gameOver = true;

    expect(component.isRecentMove(5)).toBe(false);
  });

  it('should generate correct button classes for empty cell', () => {
    const classes = component.getButtonClass(0, null);

    expect(classes).toContain('cursor-pointer');
    expect(classes).toContain('bg-white/5');
  });

  it('should generate correct button classes for occupied cell', () => {
    const classes = component.getButtonClass(0, 'X');

    expect(classes).toContain('cursor-not-allowed');
    expect(classes).toContain('bg-white/10');
  });

  it('should identify winning positions correctly', () => {
    component.gameState!.board = ['X', 'X', 'X', null, null, null, null, null, null];
    component.gameState!.winner = 'X';
    component.gameState!.gameOver = true;

    expect(component['isWinningPosition'](0)).toBe(true);
    expect(component['isWinningPosition'](1)).toBe(true);
    expect(component['isWinningPosition'](2)).toBe(true);
    expect(component['isWinningPosition'](3)).toBe(false);
  });

  it('should not identify winning positions when game is draw', () => {
    component.gameState!.winner = 'Draw';
    component.gameState!.gameOver = true;

    expect(component['isWinningPosition'](0)).toBe(false);
  });
});
