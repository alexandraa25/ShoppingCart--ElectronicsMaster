import { CommonModule, NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup-message',
  templateUrl: './popup-message.component.html',
  styleUrls: ['./popup-message.component.css'],
  standalone: true,
  imports: [NgClass,CommonModule], // Importă explicit NgClass
})
export class PopupMessageComponent {
  @Input() title: string = 'Notification';
  @Input() message: string = 'This is a notification message.';
  @Input() isError: boolean = false; // Flag to determine the type of message
  @Input() isVisible: boolean = false; // Controls the visibility of the popup

  @Output() onClose = new EventEmitter<void>();
  @Input() confirmMode = false;  // dacă true, afișăm două butoane
@Output() confirm = new EventEmitter<void>();

  closePopup(): void {
    this.isVisible = false;
    this.onClose.emit();
  }
}
