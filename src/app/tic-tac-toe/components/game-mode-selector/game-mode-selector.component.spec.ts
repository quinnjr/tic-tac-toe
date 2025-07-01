import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameModeSelectorComponent } from './game-mode-selector.component';
import { GameState } from '../../../game.service';

describe('GameModeSelectorComponent', () => {
  let component: GameModeSelectorComponent;
  let fixture: ComponentFixture<GameModeSelectorComponent>;

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
      imports: [GameModeSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GameModeSelectorComponent);
    component = fixture.componentInstance;
    component.gameState = mockGameState;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit gameModeSelected when human-vs-human is selected', () => {
    spyOn(component.gameModeSelected, 'emit');

    component.setGameMode('human-vs-human');

    expect(component.gameModeSelected.emit).toHaveBeenCalledWith('human-vs-human');
  });

  it('should emit gameModeSelected when human-vs-ai is selected', () => {
    spyOn(component.gameModeSelected, 'emit');

    component.setGameMode('human-vs-ai');

    expect(component.gameModeSelected.emit).toHaveBeenCalledWith('human-vs-ai');
  });

  it('should emit gameModeSelected when ai-vs-ai is selected', () => {
    spyOn(component.gameModeSelected, 'emit');

    component.setGameMode('ai-vs-ai');

    expect(component.gameModeSelected.emit).toHaveBeenCalledWith('ai-vs-ai');
  });

  it('should return active class for current game mode', () => {
    component.gameState!.gameMode = 'human-vs-human';

    const buttonClass = component.getModeButtonClass('human-vs-human');

    expect(buttonClass).toContain('bg-blue-500 text-white');
  });

  it('should return active class for human-vs-ai mode', () => {
    component.gameState!.gameMode = 'human-vs-ai';

    const buttonClass = component.getModeButtonClass('human-vs-ai');

    expect(buttonClass).toContain('bg-green-500 text-white');
  });

  it('should return active class for ai-vs-ai mode', () => {
    component.gameState!.gameMode = 'ai-vs-ai';

    const buttonClass = component.getModeButtonClass('ai-vs-ai');

    expect(buttonClass).toContain('bg-purple-500 text-white');
  });

  it('should return inactive class for non-current game mode', () => {
    component.gameState!.gameMode = 'human-vs-human';

    const buttonClass = component.getModeButtonClass('human-vs-ai');

    expect(buttonClass).toContain('bg-white/20 text-gray-300 hover:bg-white/30');
  });
});
