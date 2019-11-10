import { Component, OnInit } from '@angular/core';

declare var particlesJS: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  theme = 'light';
  jsonPath = 'assets/particles-light.json';
  magicWord = 'akshay';

  constructor() {
    this.setTheme();
    this.trackMagicWord();
  }

  ngOnInit() {
    // this.setThemeTo('light');
  }

  setTheme() {
    const d = new Date();
    if (d.getMinutes() % 2 === 0) {
      this.setThemeTo('dark');
    } else {
      this.setThemeTo('light');
    }
  }

  setThemeTo(theme) {
    this.theme = theme;
    this.jsonPath = 'assets/particles-' + theme + '.json';
    particlesJS.load('particles-js', this.jsonPath, () => {});
  }

  trackMagicWord() {
    let word = '';
    document.addEventListener('keydown', (e) => {
      // console.log(e, e.key);
      word += e.key;
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Backspace') {
        word = '';
      }
      if (word.toLowerCase() === this.magicWord) {
        if (this.theme === 'light') {
          this.setThemeTo('dark');
        } else {
          this.setThemeTo('light');
        }
        word = '';
      }
      // console.log(word);
    }, true);

  }
}
