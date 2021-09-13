import {Component, OnInit} from '@angular/core';
import {WPService} from '../core/services/w-p.service';
import * as _ from "lodash";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {



  lancamentos:any[] = [];
  posts:any[] = [];
  currentPost = 0;
  constructor(private lancamentoService: WPService) {
  }

  ngOnInit() {

    this.lancamentoService.all().subscribe(value => {
      console.log(value.body);
      this.lancamentos = value.body;
      if (this.lancamentos.length > 6) {
        this.lancamentos = this.lancamentos.slice(0, 6);
      }

    });

    this.lancamentoService.posts().subscribe(value => {
      console.log(value);
      this.posts = value;
      if (this.posts.length > 6) {
        this.posts = this.posts.slice(0, 6);
      }
    });


  }

  nextPost() {
    this.currentPost += 1;
    if(this.currentPost === this.posts.length) {
      this.currentPost = 0;
    }
  }

  prevPost() {
    this.currentPost -= 1;
    if(this.currentPost < 0) {
      this.currentPost = this.posts.length - 1;
    }

  }

  anotherPosts(): any[] {
    return this.posts.filter((value, index) => index !== this.currentPost);
  }

  removeHTML(html: string): string {
    if(!html) {
      return '';
    }
    return html.replace(/<[^>]+>/g, '').replace('[&hellip;]', '...');
  }

}
