import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  rootView = true;

  constructor(private router: Router) {
    router.events.subscribe((event) => {
      console.log(event);
      if (event instanceof NavigationEnd && event.url === '/imoveis') {
        this.rootView = false;
      }
    });
  }

  ngOnInit() {
    // console.log(this.router);
    // this.rootView = this.router.url;
  }

}
