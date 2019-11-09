import { Component, OnInit } from '@angular/core';

declare var particlesJS: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  theme = 'light';
  constructor() { }

  ngOnInit() {
    /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
    // particlesJS.load('particles-js', 'assets/particles.json', function() {
    //   console.log('callback - particles.js config loaded');
    // });
    particlesJS.load('particles-js', 'assets/particles.json', () => {
      // console.log('callback - particles.js config loaded');
      console.log('');
    });
    const d = new Date();
    if (d.getMinutes() % 2 === 0) {
      this.theme = 'dark';
    } else {
      this.theme = 'light';
    }
  }

}
