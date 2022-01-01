import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from '../users/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}
  url = '/api/users';

  getAllItems(): Observable<Object> {
    return this.http.get(this.url);
  }

  get(
    params: Record<string, string | number> = {}
  ): Observable<{ items: User[]; count: string }> {
    return this.http.get(this.url, { params, observe: 'response' }).pipe(
      map((usersResponse) => ({
        items: usersResponse.body as User[],
        count: usersResponse.headers.get('x-total-count') as string,
      }))
    );
  }

  create(payload: User) {
    return this.http.post(this.url, payload);
  }

  update(payload: User) {
    return this.http.patch(`${this.url}/${payload.id}`, payload);
  }

  delete(payload: User) {
    return this.http.delete(`${this.url}/${payload.id}`);
  }
}
