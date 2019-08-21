import {Component, OnInit, ViewChild} from '@angular/core';
import {Imovel} from '../imoveis/models/imovel.model';
import {ImoveisService} from '../imoveis/imoveis.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-imovel',
  templateUrl: './imovel.component.html',
  styleUrls: ['./imovel.component.css']
})
export class ImovelComponent implements OnInit {

  imovel: Imovel;
  mySlideOptions = {items: 1, dots: true, nav: false};
  myCarouselOptions = {items: 3, dots: true, nav: true};


  constructor(private route: ActivatedRoute, private imoveisService: ImoveisService) { }

  ngOnInit() {

    this.route.params.subscribe( params => {
      this.imoveisService.imoveisBySigla(params.id).subscribe((value: Imovel) => {
        this.imovel = value[0];
        console.log(this.imovel);
      });
    });


    // cd-google-map
  }

}
