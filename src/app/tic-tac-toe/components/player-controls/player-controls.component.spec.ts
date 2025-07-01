import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerControlsComponent } from './player-controls.component';
import { GameState } from '../../../game.service';

describe('PlayerControlsComponent', () => {
  let component: PlayerControlsComponent;
  let fixture: ComponentFixture<PlayerControlsComponent>;

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
      imports: [PlayerControlsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerControlsComponent);
    component = fixture.componentInstance;
    component.gameState = mockGameState;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit playerControlSwitched when switching to human', () => {
    spyOn(component.playerControlSwitched, 'emit');

    component.switchPlayerControl('X', 'human');

    expect(component.playerControlSwitched.emit).toHaveBeenCalledWith({ player: 'X', control: 'human' });
  });

  it('should emit playerControlSwitched when switching to AI', () => {
    spyOn(component.playerControlSwitched, 'emit');

    component.switchPlayerControl('O', 'ai');

    expect(component.playerControlSwitched.emit).toHaveBeenCalledWith({ player: 'O', control: 'ai' });
  });

  it('should emit playerAlgorithmChanged when setting algorithm', () => {
    spyOn(component.playerAlgorithmChanged, 'emit');

    component.setPlayerAlgorithm('X', 'minimax');

    expect(component.playerAlgorithmChanged.emit).toHaveBeenCalledWith({ player: 'X', algorithm: 'minimax' });
  });

  it('should emit aiMoveRequested when making AI move', () => {
    spyOn(component.aiMoveRequested, 'emit');

    component.makeAIMove();

    expect(component.aiMoveRequested.emit).toHaveBeenCalled();
  });

  it('should correctly identify human players', () => {
    expect(component.isPlayerHuman('X')).toBe(true);
    expect(component.isPlayerHuman('O')).toBe(true);

    component.gameState!.playerXControl = 'ai';
    expect(component.isPlayerHuman('X')).toBe(false);
  });

  it('should correctly identify AI players', () => {
    expect(component.isPlayerAI('X')).toBe(false);
    expect(component.isPlayerAI('O')).toBe(false);

    component.gameState!.playerOControl = 'ai';
    expect(component.isPlayerAI('O')).toBe(true);
  });

  it('should return correct player algorithm', () => {
    expect(component.getPlayerAlgorithm('X')).toBe('alpha-beta');
    expect(component.getPlayerAlgorithm('O')).toBe('minimax');
  });

  it('should allow AI player to make move when it is their turn', () => {
    component.gameState!.playerXControl = 'ai';
    component.gameState!.currentPlayer = 'X';
    component.gameState!.gameOver = false;

    expect(component.canPlayerMakeMove('X')).toBe(true);
  });

  it('should not allow player to make move when game is over', () => {
    component.gameState!.playerXControl = 'ai';
    component.gameState!.currentPlayer = 'X';
    component.gameState!.gameOver = true;

    expect(component.canPlayerMakeMove('X')).toBe(false);
  });

  it('should return correct control button class for active state', () => {
    const buttonClass = component.getControlButtonClass('X', 'human');
    expect(buttonClass).toContain('bg-red-500 text-white');
  });

  it('should return correct control button class for inactive state', () => {
    const buttonClass = component.getControlButtonClass('X', 'ai');
    expect(buttonClass).toContain('bg-white/20 text-gray-300');
  });

  it('should return correct algorithm button class for active state', () => {
    const buttonClass = component.getAlgorithmButtonClass('X', 'alpha-beta');
    expect(buttonClass).toContain('bg-red-500 text-white');
  });

  it('should return correct algorithm button class for inactive state', () => {
    const buttonClass = component.getAlgorithmButtonClass('X', 'minimax');
    expect(buttonClass).toContain('bg-white/20 text-gray-300');
  });
});
