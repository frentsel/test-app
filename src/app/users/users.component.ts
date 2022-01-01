import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatInput } from '@angular/material/input';
import { filter, map, switchMap, zip } from 'rxjs';

import { User } from './user.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CreateUserDialogComponent } from '../create-user-dialog/create-user-dialog.component';
import { Learning } from '../learnings/learning.model';
import { UserService } from '../services/user.service';
import { LearningService } from '../services/learning.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = [
    'avatar',
    'name',
    'email',
    'learnings',
    'actions',
  ];
  users: User[] = [];
  learnings: Learning[] = [];
  page = 1;
  limit = 5;
  resultsLength = '0';

  private learningsMap: { [key: number]: string } = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatInput) input: MatInput;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private learningService: LearningService
  ) {}

  ngOnInit(): void {
    this.getUsers().toPromise();
  }

  createUser(): void {
    const emptyUser = {
      name: '',
      email: '',
      avatar: '',
      learnings: [],
    };
    this.dialog
      .open(CreateUserDialogComponent, {
        width: '400px',
        data: {
          learnings: this.learnings.filter(({ status }) => status),
          user: emptyUser,
        },
      })
      .afterClosed()
      .pipe(
        filter((status) => status),
        switchMap((user) => this.userService.create(user)),
        switchMap(() => this.getUsers())
      )
      .toPromise();
  }

  editUser(user: User): void {
    this.dialog
      .open(CreateUserDialogComponent, {
        width: '400px',
        data: {
          learnings: this.learnings.filter(({ status }) => status),
          user,
        },
      })
      .afterClosed()
      .pipe(
        filter((status) => status),
        switchMap((user) => this.userService.update(user)),
        switchMap(() => this.getUsers())
      )
      .toPromise();
  }

  deleteUser(user: User): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: {
          title: 'Confirm Action',
          message: `Are you sure you want to do this?`,
          el: user,
        },
      })
      .afterClosed()
      .pipe(
        filter((status) => status),
        switchMap(() => this.userService.delete(user)),
        switchMap(() => this.getUsers())
      )
      .toPromise();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.getUsers('id', 'desc', filterValue).toPromise();
  }

  resetFilter() {
    this.getUsers('id', 'desc', '').toPromise();
    this.input.value = '';
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

  private getUsers(_sort = 'id', _order = 'desc', q = '') {
    const getUsers$ = this.userService.get({
      _sort,
      _order,
      _page: this.page,
      _limit: this.limit,
      q
    });
    return zip(
      this.learningService.getAllItems(),
      getUsers$
    ).pipe(
      map(([learnings, { items, count }]) => {
        this.learnings = learnings as Learning[];
        (learnings as Learning[])
          .filter((el: Learning) => el.status)
          .forEach((el: Learning) => {
            this.learningsMap[el.id] = el.name;
          });
        this.users = items;
        this.resultsLength = count;
      })
    );
  }

  getLearnings(items: number[]): string[] {
    return items.reduce((acc: string[], id: number) => {
      if (this.learningsMap[id]) {
        acc.push(this.learningsMap[id]);
      }
      return acc;
    }, []).sort();
  }
}
