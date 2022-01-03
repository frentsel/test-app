import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort, Sort } from '@angular/material/sort';
import { MatInput } from '@angular/material/input';
import { filter, map, switchMap, zip } from 'rxjs';
import { pick } from 'lodash';

import { Learning } from './learning.model';
import { CreateLearningDialogComponent } from '../create-learning-dialog/create-learning-dialog.component';
import { User } from '../users/user.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
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
    private userService: UserService,
    private learningService: LearningService
  ) {}

  ngOnInit(): void {
    this.getData().subscribe();
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
        switchMap(() => this.learningService.delete(el, this.users)),
        switchMap(() => this.getData())
      )
      .subscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.getData('id', 'desc', filterValue).subscribe();
  }

  resetFilter() {
    this.getData('id', 'desc', '').subscribe();
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
        switchMap((payload) =>
          this.learningService.update(payload, payload.users, this.users)
        ),
        switchMap(() => this.getData())
      )
      .subscribe();
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
          const payload = pick(data, ['name', 'status']);
          return this.learningService.create(payload, data.users, this.users);
        }),
        switchMap(() => this.getData())
      )
      .subscribe();
  }

  changeStatus($event: MatSlideToggleChange, learning: Learning): void {
    this.learningService
      .updateStatus({
        id: learning.id,
        status: $event.checked,
      })
      .subscribe();
  }

  ngAfterViewInit() {
    this.sort.sortChange
      .pipe(
        filter((a: Sort) => Boolean(a.direction)),
        switchMap((a: Sort) => {
          this.paginator.pageIndex = 0;
          return this.getData(a.active, a.direction);
        })
      )
      .subscribe();

    this.paginator.page
      .pipe(
        switchMap(({ pageIndex }: PageEvent) => {
          this.page = pageIndex + 1;
          return this.getData();
        })
      )
      .subscribe();
  }

  assignedUsersNumber(el: Learning): number {
    return this.users
      .filter((user: User) => user.learnings.includes(el.id))
      .map(({ id }) => id).length;
  }

  getData(_sort = 'id', _order = 'desc', q = '') {
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
