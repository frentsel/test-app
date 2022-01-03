import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { LearningService } from './learning.service';
import { UserService } from './user.service';

describe('LearningService', () => {
  let service: LearningService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatButtonModule
      ],
      providers: [
        UserService
      ]
    });
    service = TestBed.inject(LearningService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('load all items by getAllItems() request', (done) => {
    service.getAllItems().subscribe(done);

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it('load specific items by get() request', (done) => {
    service.get().subscribe(done);

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it('updateStatus() method calls the http.patch method', (done) => {
    const payload = { id: 1, name: 'test' };
    service.updateStatus(payload).subscribe(done);

    const req = httpMock.expectOne(`${service.url}/${payload.id}`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });
});
