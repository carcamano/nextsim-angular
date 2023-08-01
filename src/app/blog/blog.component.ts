import {AfterViewInit, Component, OnInit} from '@angular/core';
import {WPService} from '../core/services/w-p.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, AfterViewInit {

  posts: any[];
  allPosts: any[] = [];

  taxonomies: any[] = [];

  pages = 0;
  currentPage = 1;

  currentTaxonomy = '';

  constructor(private lancamentoService: WPService) { }

  ngOnInit() {
    this.lancamentoService.posts().subscribe(value => {
      this.allPosts = value;
      this.changePage(1);
    });

    this.lancamentoService.taxonomies().subscribe((value: any[]) => {
      this.taxonomies = value.filter(value1 => value1.slug !== 'sem-categoria');
    });
  }

  ngAfterViewInit() {
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  changePage(page: number) {
    this.pages = this.allPosts.length;
    this.currentPage = page;
    if (this.allPosts.length > 10) {
      this.posts = _.chunk(this.allPosts, 10)[this.currentPage - 1];
    } else {
      this.posts = this.allPosts;
    }
    this.scrollTop();
  }

  changeCategory(category: any) {
    this.currentTaxonomy = category ? category.slug : '';
    this.lancamentoService.posts(category ? category.id : null).subscribe(value => {
      this.allPosts = value;
      this.changePage(1);
    });
  }



  removeHTML(html = ''): string {
    return html.replace(/<[^>]+>/g, '').replace('[&hellip;]', '...');
  }

  private scrollTop() {
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }
}
