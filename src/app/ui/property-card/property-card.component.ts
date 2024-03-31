import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {getFormattedPrice, toArea, toBath, toDormis, toSalas, toVaga} from '../../core/utils/imovel.util';
import {Imovel} from '../../imoveis/models/imovel.model';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {OwlOptions} from 'ngx-owl-carousel-o';
import {CustomSearchComponent} from '../../core/components/custom-search/custom-search.component';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {AllImoveis} from '../../core/services/all-imoveis.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Firestore} from '@angular/fire/firestore';
import {CustomSearchType} from '../../core/components/custom-search/custom-search.enum';

@Component({
  selector: 'app-property-card',
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss']
})
export class PropertyCardComponent implements OnInit {

  @Input() imovel: Imovel;

  // MASKS = MASKS;


  breadcrumbTitle: string = null;

  mySlideOptions: OwlOptions = {
    items: 1, dots: true, nav: false, navText: ['<', '>'],
  };


  toSalas = toSalas;
  toDormis = toDormis;
  toArea = toArea;
  toBath = toBath;
  toVaga = toVaga;
  getFormattedPrice = getFormattedPrice;

  @ViewChild('customSearch') customSearch: CustomSearchComponent;

  constructor(private route: ActivatedRoute, private ngxService: NgxUiLoaderService, private all: AllImoveis,
              private router: Router, private modalService: NgbModal, private firestore: Firestore) {
  }

  ngOnInit() {
  }


  openFilter() {
    this.customSearch.type = CustomSearchType.complex;
    this.customSearch.showMe = true;
  }

  goImovel(imovel: Imovel) {
    this.router.navigate(['/imoveis/' + imovel.sigla]).then();
  }


  imagensCarousel(images: string[]) {
    return _.slice(images, 0, 4);
  }


  getprice(imovel: Imovel): string {
    if (!imovel) {
      return '?';
    }
    try {
      if (imovel.comercializacao.locacao && imovel.comercializacao.locacao.ativa) {
        return this.getFormattedPrice(imovel.comercializacao.locacao.preco);
      } else if (imovel.comercializacao.venda && imovel.comercializacao.venda.ativa) {
        return this.getFormattedPrice(imovel.comercializacao.venda.preco);
      }
    } catch (e) {
    }
    return '?';
  }

}
