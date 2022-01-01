import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Learning } from '../learnings/learning.model';

import { User } from '../users/user.model';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string, el: User | Learning }
  ) {
  }

  onConfirm(): void {
    this.dialogRef.close(this.data.el);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
