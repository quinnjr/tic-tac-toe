import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpModalComponent } from './help-modal.component';

describe('HelpModalComponent', () => {
  let component: HelpModalComponent;
  let fixture: ComponentFixture<HelpModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HelpModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display modal when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();
    const modalElement = fixture.nativeElement.querySelector('.fixed.inset-0');
    expect(modalElement).toBeFalsy();
  });

  it('should display modal when isOpen is true', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const modalElement = fixture.nativeElement.querySelector('.fixed.inset-0');
    expect(modalElement).toBeTruthy();
  });

  it('should emit close event when onClose is called', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit close event when backdrop is clicked', () => {
    spyOn(component.close, 'emit');
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div')
    };
    // Make target and currentTarget the same to simulate backdrop click
    mockEvent.target = mockEvent.currentTarget;

    component.onBackdropClick(mockEvent as any);
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should not emit close event when modal content is clicked', () => {
    spyOn(component.close, 'emit');
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div')
    };
    // Different target and currentTarget simulate clicking inside modal

    component.onBackdropClick(mockEvent as any);
    expect(component.close.emit).not.toHaveBeenCalled();
  });

  it('should stop event propagation when stopPropagation is called', () => {
    const mockEvent = {
      stopPropagation: jasmine.createSpy('stopPropagation')
    };

    component.stopPropagation(mockEvent as any);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should display help content when modal is open', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement?.textContent).toContain('How to Play Tic-Tac-Toe');

    const rulesSection = fixture.nativeElement.querySelector('section');
    expect(rulesSection).toBeTruthy();
  });

  it('should have close button that triggers onClose', () => {
    component.isOpen = true;
    fixture.detectChanges();

    spyOn(component, 'onClose');

    const closeButtons = fixture.nativeElement.querySelectorAll('button');
    const headerCloseButton = closeButtons[0]; // First button is the X in header

    headerCloseButton.click();
    expect(component.onClose).toHaveBeenCalled();
  });

  it('should have Got It button that triggers onClose', () => {
    component.isOpen = true;
    fixture.detectChanges();

    spyOn(component, 'onClose');

    const gotItButton = fixture.nativeElement.querySelector('button[class*="bg-blue-600"]');
    gotItButton.click();
    expect(component.onClose).toHaveBeenCalled();
  });
});
