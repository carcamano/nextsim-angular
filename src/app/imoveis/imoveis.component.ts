import {Component, OnInit} from '@angular/core';
import {ImoveisService} from './imoveis.service';
import {Imovel} from './models/imovel.model';

@Component({
  selector: 'app-imoveis',
  templateUrl: './imoveis.component.html',
  styleUrls: ['./imoveis.component.css']
})
export class ImoveisComponent implements OnInit {


  imoveis: Imovel[];

  mySlideOptions = {items: 1, dots: true, nav: false};
  myCarouselOptions = {items: 3, dots: true, nav: true};

  constructor(private imoveisService: ImoveisService) {
  }

  ngOnInit() {
    this.imoveisService.imoveis().subscribe((value: Imovel[]) => {

      this.imoveis = value.filter((value1, index) => {
        return index < 10;
      });

      console.log(this.imoveis);
    });

  }

}
