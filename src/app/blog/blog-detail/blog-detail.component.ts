import {AfterViewInit, Component, OnInit} from '@angular/core';
import {LancamentoService} from "../../home/lancamento.service";
import {ActivatedRoute} from "@angular/router";
import * as moment from "moment";

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit, AfterViewInit {

  post: any;

  constructor(private lancamentoService: LancamentoService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((value) => {
      if (value.has('post')) {
        this.lancamentoService.post(value.get('post')).subscribe(post => {

          if (post && post instanceof Array && (post as []).length > 0) {
            this.post = post[0];
            console.log(this.post);
          }
        });

      }
    })
  }

  ngAfterViewInit() {
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  date(d: string): string {
    return moment(d).format('L');
  }

}
