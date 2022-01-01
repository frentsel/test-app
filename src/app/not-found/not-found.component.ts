import { Component } from '@angular/core';

@Component({
  template: `<h1>Page not found</h1>
  <img
    src="https://i.giphy.com/media/3oEduTObiUMV3vD69y/giphy.webp"
    alt="404 error"
  />`,
  styles: [`:host {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    flex-grow: 1;
    justify-content: center;
  }`]
})
export class NotFoundComponent {}
