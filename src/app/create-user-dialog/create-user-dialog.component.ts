import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Learning } from '../learnings/learning.model';
import { User } from '../users/user.model';

@Component({
  selector: 'app-create-user-dialog',
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss'],
})
export class CreateUserDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CreateUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User; learnings: Learning[] }
  ) {}

  form: FormGroup = new FormGroup({
    name: new FormControl(this.data.user.name, [Validators.required]),
    email: new FormControl(this.data.user.email, [
      Validators.required,
      Validators.email,
    ]),
    avatar: new FormControl(this.data.user.avatar),
    learnings: new FormControl(this.data.user.learnings),
  });

  ngOnInit() {
    if (this.data.user?.id) {
      this.form.addControl('id', new FormControl(this.data.user.id));
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close(this.form.value);
  }
}
