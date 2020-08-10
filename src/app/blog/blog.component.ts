import {AfterViewInit, Component, OnInit} from '@angular/core';
import {LancamentoService} from "../home/lancamento.service";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, AfterViewInit {

  posts:any[] = [];
  constructor(private lancamentoService: LancamentoService) { }

  ngOnInit() {
    this.lancamentoService.posts().subscribe(value => {
      console.log(value);
      this.posts = value;
      if (this.posts.length > 6) {
        this.posts = this.posts.slice(0, 5);
      }
    });
  }

  ngAfterViewInit() {
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }


  removeHTML(html = ''): string {
    return html.replace(/<[^>]+>/g, '').replace('[&hellip;]', '...');
  }

}
