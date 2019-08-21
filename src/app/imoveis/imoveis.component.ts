import {Component, OnInit} from '@angular/core';
import {ImoveisService} from './imoveis.service';
import {Imovel} from './models/imovel.model';
import {ActivatedRoute} from '@angular/router';
import {HttpResponse} from '@angular/common/http';

@Component({
  selector: 'app-imoveis',
  templateUrl: './imoveis.component.html',
  styleUrls: ['./imoveis.component.css']
})
export class ImoveisComponent implements OnInit {

  pages = Array(0).fill(1).map((x, i) => i);
  currentPage = 1;

  private itensPerPage = 30;


  imoveis: Imovel[];

  queryParams: any;

  mySlideOptions = {items: 1, dots: true, nav: false};
  myCarouselOptions = {items: 3, dots: true, nav: true};

  constructor(private imoveisService: ImoveisService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;
      this.getImoveis();
    });
  }

  changePage(page: number) {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.getImoveis();
    }
  }

  private getImoveis() {
    this.imoveis = [];
    this.pages = Array(0).fill(1).map((x, i) => i);
    // this.currentPage = 1;
    this.imoveisService.imoveis(this.queryParams, this.currentPage).subscribe((res: HttpResponse<Imovel[]>) => {
      this.pages = Array(Math.ceil(Number(res.headers.get('X-Total-Count')) / this.itensPerPage)).fill(1).map((x, i) => i + 1);
      this.imoveis = res.body;
      console.log(res);
    });
  }

}
