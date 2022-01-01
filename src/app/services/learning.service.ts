import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { difference, find, omit, pick, uniq } from 'lodash';

import { UserService } from './user.service';
import { Learning } from '../learnings/learning.model';
import { User } from '../users/user.model';

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  constructor(private http: HttpClient, private userService: UserService) {}
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

  create(
    payload: Partial<Learning>,
    usersIds: number[] = [],
    users: User[] = []
  ) {
    return this.http.post<Learning>(this.url, payload).pipe(
      switchMap((data: Learning) => {
        const requests: Observable<Object>[] = [];
        users.forEach((user) => {
          if (usersIds.includes(user.id)) {
            user.learnings.push(data.id);
            const payload = pick(user, ['id', 'learnings']);
            requests.push(this.userService.update(payload));
          }
        });
        return forkJoin(requests);
      })
    );
  }

  update(el: { id: number } & Partial<Learning>, usersIds: number[] = [], users: User[] = []) {
    return this.http.patch(`${this.url}/${el.id}`, omit(el, 'users')).pipe(
      switchMap(() => {
        const queries: any = [];
        const prevUsers = users
          .filter(({ learnings }: User) => learnings.includes(el.id))
          .map((user) => user.id);
        const remove = difference(prevUsers, usersIds);
        const add = difference(usersIds, prevUsers);

        // remove the lerning from the user
        remove.forEach((id) => {
          const user = find(users, { id });
          if (user) {
            user.learnings = uniq(
              user.learnings.filter((lid) => lid !== el.id)
            );
            queries.push(this.userService.update(user));
          }
        });

        // add the lerning from the user
        add.forEach((id) => {
          const user = find(users, { id });
          if (user) {
            user.learnings.push(el.id);
            user.learnings = uniq(user.learnings);
            queries.push(this.userService.update(user));
          }
        });

        return forkJoin(queries);
      })
    );
  }

  updateStatus(payload: { id: number } & Partial<Learning>) {
    return this.http.patch(`${this.url}/${payload.id}`, payload);
  }

  delete(payload: Learning, users: User[] = []) {
    return this.http.delete(`${this.url}/${payload.id}`).pipe(
      switchMap(() => {
        const queries = users
          .filter(({ learnings }: User) => learnings.includes(payload.id))
          .map((user: User) => {
            user.learnings = user.learnings.filter((lid) => lid !== payload.id);
            return this.userService.update(user);
          });
        return forkJoin(queries);
      })
    );
  }
}
