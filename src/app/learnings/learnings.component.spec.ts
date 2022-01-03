import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LearningsComponent } from './learnings.component';
import { LearningService } from '../services/learning.service';
import { UserService } from '../services/user.service';
import { of } from 'rxjs';

describe('LearningsComponent', () => {
  let component: LearningsComponent;
  let fixture: ComponentFixture<LearningsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        MatTableModule,
        MatDialogModule,
        MatPaginatorModule,
        MatSortModule,
      ],
      providers: [
        UserService,
        LearningService,
      ],
      declarations: [ LearningsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.input = jasmine.createSpyObj('value', [''])
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit() calls getData() method', () => {
    const getUsersSpy = spyOn(component, 'getData').and.returnValue(of());
    component.ngOnInit();
    expect(getUsersSpy).toHaveBeenCalled();
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
