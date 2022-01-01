import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort, Sort } from '@angular/material/sort';
import {
  filter,
  forkJoin,
  lastValueFrom,
  map,
  Observable,
  switchMap,
  zip,
} from 'rxjs';

import { Learning } from './learning.model';
import { CreateLearningDialogComponent } from '../create-learning-dialog/create-learning-dialog.component';
import { User } from '../users/user.model';
import { MatInput } from '@angular/material/input';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { difference, find, uniq } from 'lodash';
import { UserService } from '../services/user.service';
import { LearningService } from '../services/learning.service';

@Component({
  selector: 'app-learnings',
  templateUrl: './learnings.component.html',
  styleUrls: ['./learnings.component.scss'],
})
export class LearningsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'status', 'users', 'actions'];
  users: User[] = [];
  learnings: Learning[] = [];
  page = 1;
  limit = 5;
  resultsLength = '0';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatInput) input: MatInput;

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private userService: UserService,
    private learningService: LearningService
  ) {}

  ngOnInit(): void {
    lastValueFrom(this.getUsers());
  }

  deleteEl(el: Learning): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: {
          title: 'Confirm Action',
          message: `Are you sure you want to do this?`,
          el,
        },
      })
      .afterClosed()
      .pipe(
        filter((status) => status),
        switchMap(() => this.learningService.delete(el)),
        switchMap(() => this.getUsers())
      )
      .toPromise();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    lastValueFrom(this.getUsers('id', 'desc', filterValue));
  }

  resetFilter() {
    lastValueFrom(this.getUsers('id', 'desc', ''));
    this.input.value = '';
  }

  editEl(el: Learning): void {
    this.dialog
      .open(CreateLearningDialogComponent, {
        width: '400px',
        data: {
          el,
          users: this.users,
        },
      })
      .afterClosed()
      .pipe(
        filter((status) => status),
        switchMap((el) => {
          const users = [...el.users];
          delete el.users;
          const queries = [this.learningService.update(el)];
          const prevUsers = this.users
            .filter((user) => user.learnings.includes(el.id))
            .map((user) => user.id);
          const remove = difference(prevUsers, users);
          const add = difference(users, prevUsers);

          // remove the lerning from the user
          remove.forEach((id) => {
            const user = find(this.users, { id });
            if (user) {
              user.learnings = uniq(
                user.learnings.filter((lid) => lid !== el.id)
              );
              queries.push(this.userService.update(user));
            }
          });

          // add the lerning from the user
          add.forEach((id) => {
            const user = find(this.users, { id });
            if (user) {
              user.learnings.push(el.id);
              queries.push(this.userService.update(user));
            }
          });

          return forkJoin(queries);
        }),
        switchMap(() => this.getUsers())
      )
      .toPromise();
  }

  createLerning(): void {
    this.dialog
      .open(CreateLearningDialogComponent, {
        width: '400px',
        data: {
          el: { name: '', status: true },
          users: this.users,
        },
      })
      .afterClosed()
      .pipe(
        filter((status) => status),
        switchMap((data: Learning & { users: number[] }) => {
          const payload = { name: data.name, status: data.status };
          return this.learningService
            .create(payload)
            .pipe(map((learning) => ({ ...learning, ...data })));
        }),
        switchMap((data: Learning & { users: number[] }) => {
          const requests: Observable<Object | void>[] = [this.getUsers()];
          if (data.users?.length) {
            this.users.forEach((user) => {
              if ((data.users || []).includes(user.id)) {
                const payload = {
                  ...user,
                  learnings: [...user.learnings, data.id],
                };
                requests.push(this.userService.update(payload));
              }
            });
          }
          return forkJoin(requests);
        })
      )
      .subscribe();
  }

  changeStatus($event: MatSlideToggleChange, learning: Learning): void {
    lastValueFrom(
      this.learningService.update({
        id: learning.id,
        status: $event.checked,
      })
    );
  }

  ngAfterViewInit() {
    this.sort.sortChange
      .pipe(
        filter((a: Sort) => Boolean(a.direction)),
        switchMap((a: Sort) => {
          this.paginator.pageIndex = 0;
          return this.getUsers(a.active, a.direction);
        })
      )
      .subscribe();

    this.paginator.page
      .pipe(
        switchMap(({ pageIndex }: PageEvent) => {
          this.page = pageIndex + 1;
          return this.getUsers();
        })
      )
      .subscribe();
  }

  assignedUsersNumber(el: Learning): number {
    return this.users
      .filter((user: User) => user.learnings.includes(el.id))
      .map(({ id }) => id).length;
  }

  private getUsers(_sort = 'id', _order = 'desc', q = '') {
    return zip(
      this.learningService.get({
        _sort,
        _order,
        _page: this.page,
        _limit: this.limit,
        q,
      }),
      this.userService.getAllItems()
    ).pipe(
      map(([{ items, count }, users]) => {
        this.users = users as User[];
        this.learnings = items;
        this.resultsLength = count;
      })
    );
  }
}
