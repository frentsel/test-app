import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { User } from '../users/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        UserService,
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load all users', (done) => {
    const allItems = [
      { id: 1, name: 'test 1' },
      { id: 2, name: 'test 2' }
    ] as User[];
    service.getAllItems().subscribe(done);

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe("GET");
    req.flush(allItems);
  });

  it('should load specific list of users', ((done) => {
    service.get({}).subscribe(done);

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe("GET");
    req.flush({});
  }));

  it('create() method calls the http.post method', ((done) => {
    const payload = { name: 'test' };
    const response = { id: 1, ...payload };
    service.create(payload as User).subscribe((data) => {
      expect(data).toBe(response);
      done();
    });

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  }));

  it('should call the http.patch method', ((done) => {
    const payload = { id: 1, name: 'test' };
    service.update(payload as User).subscribe(done);

    const req = httpMock.expectOne(`${service.url}/${payload.id}`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  }));

  it('should call the http.delete method', ((done) => {
    const payload = { id: 1, name: 'test' };
    service.delete(payload as User).subscribe(done);

    const req = httpMock.expectOne(`${service.url}/${payload.id}`);
    expect(req.request.method).toBe("DELETE");
    req.flush(payload);
  }));
});
