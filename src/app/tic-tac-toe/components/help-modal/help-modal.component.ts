import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-modal.component.html',
  styleUrl: './help-modal.component.scss'
})
export class HelpModalComponent {
  @Input() public isOpen: boolean = false;
  @Output() public close = new EventEmitter<void>();

  public onClose(): void {
    this.close.emit();
  }

  public onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  public stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
