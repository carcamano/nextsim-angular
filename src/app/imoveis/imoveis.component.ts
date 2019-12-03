import {Component, OnInit} from '@angular/core';
import {ImoveisService} from './imoveis.service';
import {Imovel} from './models/imovel.model';
import {ActivatedRoute} from '@angular/router';
import {HttpResponse} from '@angular/common/http';
import * as _ from 'lodash';

@Component({
  selector: 'app-imoveis',
  templateUrl: './imoveis.component.html',
  styleUrls: ['./imoveis.component.css']
})
export class ImoveisComponent implements OnInit {

  pages = 0;
  currentPage = 1;

  customSearch = false;

  private itensPerPage = 10;


  imoveis: Imovel[] = [];
  allImoveis: Imovel[] = [];

  queryParams: any;

  mySlideOptions = {items: 1, dots: true, nav: false};
  myCarouselOptions = {items: 3, dots: true, nav: true};

  constructor(private imoveisService: ImoveisService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;
      console.log(this.queryParams);
      this.getImoveis();
    });
  }

  changePage(page: number) {
    this.currentPage = page;
    // if (!this.customSearch) {
    this.getImoveis();
    // } else {
    //   this.filterAll();
    // }
  }

  private filterAll() {
    console.log(this.imoveis.length);
    console.log(this.allImoveis.length);

    this.imoveis = [];

    this.scrollTop();
    // setTimeout(() => {
    const filtred = this.allImoveis.filter(imovel => {
      const f = [];
      if (this.queryParams.tipo) {
        const tipos = this.queryParams.tipo.split(',');
        if (tipos.includes(imovel.tipo)) {
          f.push('t');
        } else {
          f.push('f');
        }
      }
      if (this.queryParams.finalidade) {
        if (this.queryParams.finalidade === imovel.finalidade) {
          f.push('t');
        } else {
          f.push('f');
        }
      }
      if (this.queryParams.categoria) {
        if (this.queryParams.categoria === 'comprar' && imovel.comercializacao.venda && imovel.comercializacao.venda.ativa) {
          f.push('t');
        } else if (this.queryParams.categoria === 'alugar' && imovel.comercializacao.locacao && imovel.comercializacao.locacao.ativa) {
          f.push('t');
        } else {
          f.push('f');
        }
      }
      if (this.queryParams.precos) {
        const values = this.queryParams.precos.split(',');
        if (values.length === 2) {
          if (imovel.comercializacao.venda && imovel.comercializacao.venda.preco >= values[0] &&
            imovel.comercializacao.venda.preco <= values[1]) {
            f.push('t');
          } else if (imovel.comercializacao.locacao && imovel.comercializacao.locacao.preco >= values[0] &&
            imovel.comercializacao.locacao.preco <= values[1]) {
            f.push('t');
          } else {
            f.push('f');
          }
        } else {
          f.push('f');
        }
      }

      // areas
      if (this.queryParams.area) {
        const values = this.queryParams.area.split(',');
        if (values.length === 2) {
          if (imovel.numeros && imovel.numeros.areas && imovel.numeros.areas.util >= values[0] && imovel.numeros.areas.util <= values[1]) {
            f.push('t');
          } else {
            f.push('f');
          }
        } else {
          f.push('f');
        }
      }

      // dormitorios
      if (this.queryParams.dormitorios && this.queryParams.dormitorios > 0 && this.queryParams.finalidade === 'residencial') {
        if (imovel.numeros && imovel.numeros.dormitorios && imovel.numeros.dormitorios === Number(this.queryParams.dormitorios)) {
          f.push('t');
        } else {
          f.push('f');
        }
      }

      // salas
      if (this.queryParams.dormitorios && this.queryParams.dormitorios > 0 && this.queryParams.finalidade === 'comercial') {
        if (imovel.numeros && imovel.numeros.salas && imovel.numeros.salas === Number(this.queryParams.salas)) {
          f.push('t');
        } else {
          f.push('f');
        }
      }

      // salas
      if (this.queryParams.query) {
        if (imovel.sigla.toLowerCase().includes(this.queryParams.query.toLowerCase()) ||
          imovel.local.cidade.toLowerCase().includes(this.queryParams.query.toLowerCase()) ||
          imovel.local.bairro.toLowerCase().includes(this.queryParams.query.toLowerCase())) {
          f.push('t');
        } else {
          f.push('f');
        }
      }
      return !f.includes('f');
    });

    console.log(filtred);
    this.pages = filtred.length;
    this.imoveis = _.chunk(filtred, this.itensPerPage)[this.currentPage - 1];

    // }, 2000);


  }

  private getImoveis() {
    this.imoveis = [];
    this.pages = 0;
    // this.currentPage = 1;
    if (this.queryParams.custom || this.queryParams.customSearch) {
      this.imoveisService.all().subscribe((res: Imovel[]) => {
        this.allImoveis = res;
        this.filterAll();
      });
    } else {
      if (this.queryParams.query) {
        this.imoveisService.imoveisQuery(this.queryParams.query).subscribe(imoveis => {
          this.allImoveis = imoveis;
          this.filterAll();
        });
      } else {
        this.imoveisService.imoveis(this.queryParams, this.currentPage).subscribe((res: HttpResponse<Imovel[]>) => {
          this.pages = Number(res.headers.get('X-Total-Count'));
          this.imoveis = res.body;
          console.log(res.body);
          console.log(this.imoveis.length);
          this.scrollTop();
        });
      }
    }
  }

  imagensCarousel(images: string[]) {
    return _.slice(images, 0, 3);
  }


  private scrollTop() {
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  toArea(imovel: Imovel) {
    if (!imovel) {
      return '?';
    }
    try {
      if (imovel && imovel.tipo === 'casa') {
        return imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      } else if (imovel && imovel.tipo === 'apartamento' || imovel.tipo === 'sala') {
        return imovel.numeros.areas.util.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      } else if (imovel && imovel.tipo === 'terreno') {
        return imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      }
    } catch (e) {
      // console.error(e);
    }
    return '?';
  }

  toDormis(imovel: Imovel) {
    if (!imovel) {
      return '?';
    }
    try {
      if (imovel && imovel.finalidade === 'residencial') {
        return imovel.numeros.dormitorios;
      } else if (imovel) {
        return imovel.numeros.salas;
      }
    } catch (e) {
      // console.error(e);
    }
    return '?';
  }

  getprice(imovel: Imovel) {
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
      // console.error(e);
    }

    return '?';
  }

  getFormattedPrice(price: number) {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(price);
  }


}
