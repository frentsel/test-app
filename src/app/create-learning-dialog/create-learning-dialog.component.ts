import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Learning } from '../learnings/learning.model';
import { User } from '../users/user.model';

@Component({
  selector: 'app-create-learning-dialog',
  templateUrl: './create-learning-dialog.component.html',
  styleUrls: ['./create-learning-dialog.component.scss'],
})
export class CreateLearningDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CreateLearningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { el: Learning; users: User[] }
  ) {}

  form: FormGroup = new FormGroup({
    name: new FormControl(this.data.el.name, [Validators.required]),
    status: new FormControl(this.data.el.status),
    users: new FormControl(this.selectedUsersIds()),
  });

  ngOnInit() {
    if (this.data.el?.id) {
      this.form.addControl('id', new FormControl(this.data.el.id));
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.form.value);
  }

  private selectedUsersIds(): number[] {
    const id = this.data.el.id;
    return this.data.users
      .filter((user: User) => user.learnings.includes(id))
      .map(({ id }) => id);
  }
}
