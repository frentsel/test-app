import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Learning } from '../learnings/learning.model';

@Injectable({
  providedIn: 'root'
})
export class LearningService {
  constructor(private http: HttpClient) {}
  url = '/api/learnings';

  getAllItems(): Observable<Object> {
    return this.http.get(this.url);
  }

  get(
    params: Record<string, string | number> = {}
  ): Observable<{ items: Learning[]; count: string }> {
    return this.http.get(this.url, { params, observe: 'response' }).pipe(
      map((usersResponse) => ({
        items: usersResponse.body as Learning[],
        count: usersResponse.headers.get('x-total-count') as string,
      }))
    );
  }

  create(payload: Partial<Learning>) {
    return this.http.post(this.url, payload);
  }

  update(payload: Partial<Learning>) {
    return this.http.patch(`${this.url}/${payload.id}`, payload);
  }

  delete(payload: Learning) {
    return this.http.delete(`${this.url}/${payload.id}`);
  }
}
