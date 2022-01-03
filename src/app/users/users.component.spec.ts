import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { LearningService } from '../services/learning.service';
import { UserService } from '../services/user.service';

import { UsersComponent } from './users.component';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
      ],
      providers: [
        UserService,
        LearningService,
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: { data: {} }
        },
      ],
      declarations: [ UsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.input = jasmine.createSpyObj('value', [''])
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit() calls getData() method', () => {
    const getDataSpy = spyOn(component, 'getData').and.returnValue(of());
    component.ngOnInit();
    expect(getDataSpy).toHaveBeenCalled();
  });

  it('applyFilter() calls getData() method with defined params', () => {
    const getDataSpy = spyOn(component, 'getData').and.returnValue(of());
    component.applyFilter({ target: { value: ' ABC ' } } as any);
    expect(getDataSpy).toHaveBeenCalledWith('id', 'desc', 'abc');
  });

  it('resetFilter() calls getData() method with empty string', () => {
    const getDataSpy = spyOn(component, 'getData').and.returnValue(of());
    component.resetFilter();
    expect(getDataSpy).toHaveBeenCalledWith('id', 'desc', '');
  });
});
