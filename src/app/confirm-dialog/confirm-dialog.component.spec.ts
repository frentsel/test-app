import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: { data: {}, close: () => {} }
        },
      ],
      declarations: [ ConfirmDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onConfirm() method calls dialogRef.close with a data', () => {
    const closeSpy = spyOn(component.dialogRef, 'close');
    component.onConfirm();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('onDismiss() method calls dialogRef.close with a data', () => {
    const closeSpy = spyOn(component.dialogRef, 'close');
    component.onDismiss();
    expect(closeSpy).toHaveBeenCalledWith(false);
  });
});
