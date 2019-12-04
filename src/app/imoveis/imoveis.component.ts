import {Component, OnInit} from '@angular/core';
import {ImoveisService} from './imoveis.service';
import {Imovel} from './models/imovel.model';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpResponse} from '@angular/common/http';
import * as _ from 'lodash';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {Options} from 'ng5-slider';
import {GeneralService} from './general.service';
import {CurrencyPipe, formatCurrency} from '@angular/common';

@Component({
  selector: 'app-imoveis',
  templateUrl: './imoveis.component.html',
  styleUrls: ['./imoveis.component.css']
})
export class ImoveisComponent implements OnInit {

  pages = 0;
  currentPage = 1;

  showExtraFilter = false;

  private itensPerPage = 10;


  imoveis: Imovel[] = [];
  allImoveis: Imovel[] = [];

  badges = [];

  queryParams: any;

  mySlideOptions = {items: 1, dots: true, nav: false};
  myCarouselOptions = {items: 3, dots: true, nav: true};


  /// filtro

  customSearch = {
    categoria: 'comprar',
    finalidade: 'residencial',
    quartos: 0,
    salas: 0,
    garagem: 0,
    dormitorios: 0,
    tipos: [],
    precos: {
      min: 0,
      max: 39000000,
    },
    area: {
      min: 0,
      max: 61000,
    },
    bairros: [],
    cidade: ''
  };

  minPrice = 0;
  maxPrice = 0;

  minArea = 0;
  maxArea = 0;

  tipos_residencial = [];
  tipos_comercial = [];
  locais: any;

  locaisGeral: string[];
  bairrosSelecionados: any[] = [];

  options: Options;

  optionsArea: Options;

  constructor(private imoveisService: ImoveisService, private route: ActivatedRoute, private ngxService: NgxUiLoaderService,
              private generalService: GeneralService, private router: Router) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;
      console.log(this.queryParams);
      this.buildBadges();
      this.getImoveis();
      this.loadDefaults();

    });
  }



  categoriaChange(categoria: string) {
    console.log('categoriaChange');
    this.customSearch.categoria = categoria;
  }

  dropDownChange(event: boolean) {
    console.log(event);

    if (!event) {
      console.log(this.customSearch);
      const tipos = this.customSearch.tipos.filter(value => {
        return value.selected === true;
      }).map(value => {
        return value.key;
      });
      const bairros = this.customSearch.bairros.filter(value => {
        return value.selected === true;
      }).map(value => {
        return value.key;
      });
      console.log(bairros);
      const area: string = this.customSearch.area.min + ',' + this.customSearch.area.max;
      const precos: string = this.customSearch.precos.min + ',' + this.customSearch.precos.max;
      this.search({
        finalidade: this.customSearch.finalidade, tipo: tipos.join(','),
        categoria: this.customSearch.categoria, precos: precos, area: area, custom: true,
        dormitorios: this.customSearch.dormitorios, salas: this.customSearch.salas,
        bairros: bairros.join(','), cidade: this.customSearch.cidade
      });
    }
  }

  search(query) {
    console.log('query');
    console.log(query);
    if (query) {
      this.router.navigate(['imoveis'], {
        queryParams: query
      });
    }
  }

  changePage(page: number) {
    this.currentPage = page;
    this.getImoveis();
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

      if (this.queryParams.bairros) {
        const values = this.queryParams.bairros.split(',');
        if (values.length > 0 && values.includes(imovel.local.bairro)) {
          f.push('t');
        } else {
          f.push('f');
        }

      }

      if (this.queryParams.cidade) {
        if (imovel.local.cidade === this.queryParams.cidade) {
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
    this.ngxService.start();
    // this.currentPage = 1;
    if (this.queryParams.custom || this.queryParams.customSearch) {
      this.imoveisService.all().subscribe((res: Imovel[]) => {
        this.allImoveis = res;
        this.filterAll();
        this.ngxService.stop();
      });
    } else {
      if (this.queryParams.query) {
        this.imoveisService.imoveisQuery(this.queryParams.query).subscribe(imoveis => {
          this.allImoveis = imoveis;
          this.filterAll();
          this.ngxService.stop();
        });
      } else {
        this.imoveisService.imoveis(this.queryParams, this.currentPage).subscribe((res: HttpResponse<Imovel[]>) => {
          this.pages = Number(res.headers.get('X-Total-Count'));
          this.imoveis = res.body;
          console.log(res.body);
          console.log(this.imoveis.length);
          this.scrollTop();
          this.ngxService.stop();
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

  // fitros metodes


  changeCidade(cidade: string) {
    this.customSearch.cidade = cidade;
    this.locaisGeral.map((value, index) => {
      if (value === cidade) {
        this.buildLocaisBairros(value);
      }
    });
  }

  changeTipo(event: any, i: number) {
    this.customSearch.tipos[i].selected = event.currentTarget.checked;
    console.log(this.customSearch.tipos);
  }

  changeBairro(event: any, i: number) {
    console.log('changeBairro');
    this.customSearch.bairros[i].selected = event.currentTarget.checked;
    this.bairrosSelecionados = this.customSearch.bairros.filter(value => {
      return value.selected === true;
    }).map(value => {
      return value.key;
    });
  }


  finalidadeChange(event: any) {
    if (this.customSearch.finalidade === 'residencial') {
      this.customSearch.tipos = this.tipos_residencial;
    } else {
      this.customSearch.tipos = this.tipos_comercial;
    }
  }


  private loadDefaults() {
    this.generalService.tipos_residencial().subscribe((res: HttpResponse<string[]>) => {
      this.tipos_residencial = res.body.map((value, index, array) => {
        return {key: value, selected: false, i: index};
      });
      this.customSearch.tipos = this.tipos_residencial;
      console.log(this.customSearch.tipos);
    });


    this.generalService.tipos_comercial().subscribe((res: HttpResponse<string[]>) => {
      this.tipos_comercial = res.body.map((value, index, array) => {
        return {key: value, selected: false, i: index};
      });
    });


    this.generalService.locais().subscribe((res: HttpResponse<any>) => {
      if (!this.locais) {
        this.locais = res.body;
        this.buildLocais();

      }
    });

    this.generalService.area().subscribe((res: HttpResponse<any>) => {
      this.customSearch.area.max = res.body.max;
      this.maxArea = res.body.max;
      this.customSearch.area.min = res.body.min;
      this.minArea = res.body.min;

      this.optionsArea = {
        floor: 0,
        ceil: this.customSearch.area.max,
        translate: (value: number): string => {
          return value + ' M²';
        }
      };
    });

    this.generalService.precos().subscribe((res: HttpResponse<any>) => {
      console.log(res);
      this.customSearch.precos.max = res.body.max;
      this.maxPrice = res.body.max;
      this.customSearch.precos.min = res.body.min;
      this.minPrice = res.body.min;

      this.options = {
        floor: 0,
        ceil: this.customSearch.precos.max,
        translate: (value: number): string => {
          return formatCurrency(value, 'pt-BR', 'R$', 'BRL');
        }
      };
    });
  }

  badgeClose(param: any) {
    console.log('badgeClose');
    console.log(param);
    console.log(this.queryParams[param]);
    this.router.navigate([], this.queryParams);

  }

  clearFiltro() {
    console.log('clearFiltro')
    this.router.navigate([]);
  }

  buildBadges() {
    // area: "0,61000"
    // bairros: ""
    // categoria: "comprar"
    // cidade: ""
    // custom: "true"
    // dormitorios: "0"
    // finalidade: "residencial"
    // precos: "0,39000000"
    // salas: "0"
    // tipo: ""
    this.badges = [];
    if (this.queryParams.categoria) {
      this.badges.push(this.badge(this.queryParams.categoria, 'categoria',() => {
        this.queryParams.categoria = '';
        console.log('call categoria');
      }));
    }

    if (this.queryParams.finalidade) {
      this.badges.push(this.badge(this.queryParams.finalidade, 'finalidade',() => this.queryParams.finalidade = ''));
    }

    if (this.queryParams.bairros) {
      const ss = this.queryParams.bairros.split(',');
      const f = () => this.queryParams.bairros = '';
      if (ss.length > 1) {
        this.badges.push(this.badge(`Nos bairros: ${ss.join(', ')}`, 'bairros', f));
      } else {
        this.badges.push(this.badge(`No bairro: ${ss.join(', ')}`,'bairros', f));
      }
    }

    if (this.queryParams.cidade) {
      this.badges.push(this.badge(`Na cidade de ${this.queryParams.cidade}`, this.queryParams.cidade,() => this.queryParams.cidade = ''));
    }

    if (this.queryParams.dormitorios) {
      const n = Number(this.queryParams.dormitorios);
      const f = () => this.queryParams.dormitorios = '';
      if (n === 1) {
        this.badges.push(this.badge(`Com ${n} dormitório`,this.queryParams.dormitorios, f));
      } else if(n === 4) {
        this.badges.push(this.badge(`Com ${n} ou mais dormitórios`,this.queryParams.dormitorios, f));
      } else if(n !== 0){
        this.badges.push(this.badge(`Com ${n}  dormitórios`,this.queryParams.dormitorios, f));
      }

    }

    if (this.queryParams.tipo) {
      const ss = this.queryParams.tipo.split(',');
      if (ss.length > 1) {
        this.badges.push(this.badge(`Tipos: ${ss.join(', ')}`,this.queryParams.tipo, () => this.queryParams.tipo = ''));
      } else {
        this.badges.push(this.badge(`Tipo: ${ss.join(', ')}`,this.queryParams.tipo, () => this.queryParams.tipo = ''));
      }
    }

    if (this.queryParams.precos) {
      const ss = this.queryParams.precos.split(',');


      const pMin = Number(ss[0]);
      const pMax = Number(ss[1]);

      if (pMin !== this.minPrice || pMax !== this.maxPrice) {
        const spMin = formatCurrency(Number(ss[0]), 'pt-BR', 'R$', 'BRL');
        const spMax = formatCurrency(Number(ss[1]), 'pt-BR', 'R$', 'BRL');
        this.badges.push(this.badge(`Entre: ${spMin} e ${spMax}`, this.queryParams.precos,  () => this.queryParams.precos = ''));
      }
    }
  }

  private badge(s: string, query: string, close: () => void): any {
    return {label: s, close, query };

  }

  buildLocais() {
    if (!this.locaisGeral) {
      this.locaisGeral = [];
      _.forIn(this.locais, (value, key) => {
        this.locaisGeral.push(key);
      });
      console.log(this.locaisGeral);
    }
  }

  filterLocaisBairros(cidade: string) {
    return this.customSearch.bairros.filter(value => value.c === cidade);
  }

  buildLocaisBairros(cidade: string) {
    // if (!this.customSearch.bairros.length) {
    //   this.locaisBairro = [];
    // }
    this.customSearch.bairros = [];
    _.forIn(this.locais, (value, key) => {
      if (key === cidade) {
        value.map((value2, index, array) => {
          this.customSearch.bairros.push({key: value2, selected: false, i: index, c: cidade});
        });
      }
    });
    console.log(this.customSearch.bairros);
  }


}
