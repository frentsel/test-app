import { Component } from '@angular/core';

@Component({
  template: `<h1>Test Application</h1>
  <img
    src="https://i.giphy.com/media/NsTceS2EH3Mli/giphy.webp"
    alt="happy-happy!"
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
export class HomeComponent {}
