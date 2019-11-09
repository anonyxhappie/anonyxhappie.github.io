import { Component, OnInit } from '@angular/core';

declare var particlesJS: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  theme = 'light';
  magicWord = 'akshay';

  constructor() { }

  ngOnInit() {
    this.setTheme();
    this.trackMagicWord();
    particlesJS.load('particles-js', 'assets/particles.json', () => {});
  }

  setTheme() {
    const d = new Date();
    if (d.getMinutes() % 2 === 0) {
      this.theme = 'dark';
    } else {
      this.theme = 'light';
    }
  }

  trackMagicWord() {
    let word = '';
    document.addEventListener('keydown', (e) => {
      // console.log(e, e.key);
      word += e.key;
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Backspace') {
        word = '';
      }
      if (word === this.magicWord) {
        if (this.theme === 'light') {
          this.theme = 'dark';
        } else {
          this.theme = 'light';
        }
        word = '';
      }
      // console.log(word);
    }, true);

  }
}
