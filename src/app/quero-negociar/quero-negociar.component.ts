import {Component, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'app-quero-negociar',
  templateUrl: './quero-negociar.component.html',
  styleUrls: ['./quero-negociar.component.css']
})
export class QueroNegociarComponent implements OnInit {

  height = 0;
  constructor() { }

  ngOnInit() {
    this.height = window.outerHeight;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    console.log(event);
    this.height = window.innerHeight;
  }
}
