import {Component, OnInit, ViewChild} from '@angular/core';
import {Imovel} from '../imoveis/models/imovel.model';
import {ImoveisService} from '../imoveis/imoveis.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-imovel',
  templateUrl: './imovel.component.html',
  styleUrls: ['./imovel.component.css']
})
export class ImovelComponent implements OnInit {

  imovel: Imovel;
  mySlideOptions = {items: 1, dots: true, nav: false};
  myCarouselOptions = {items: 3, dots: true, nav: true};


  constructor(private route: ActivatedRoute, private imoveisService: ImoveisService, private modalService: NgbModal) { }

  ngOnInit() {

    this.route.params.subscribe( params => {
      this.imoveisService.imoveisBySigla(params.id).subscribe((value: Imovel) => {
        this.imovel = value[0];
        console.log(this.imovel);
      });
    });


    // cd-google-map
  }


  getFormattedPrice(price: number) {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(price);
  }


  toArea(imovel: Imovel) {
    if (imovel.tipo === 'casa') {
      const total = imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      const util = imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
    } else if (imovel.tipo === 'apartamento' || imovel.tipo === 'sala') {
      const num = imovel.numeros.areas.util.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
    } else if (imovel.tipo === 'terreno') {
      const num = imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
    }
    return '?';
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
    // @ts-ignore
      size: 'md',
      centered: true
    }).result.then((result) => {
    }, (reason) => {
    });
  }

}
