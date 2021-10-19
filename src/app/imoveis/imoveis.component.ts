import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Imovel} from './models/imovel.model';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {formatCurrency} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AllImoveis} from "../core/services/all-imoveis.service";
import {MASKS} from 'ng-brazil';
import {collection, collectionSnapshots, doc, docSnapshots, Firestore} from "@angular/fire/firestore";
import {PATH_AUTOCOMPLETE, PATH_LOCAIS} from "../core/utils/constants.util";
import {map} from "rxjs/operators";
import {OwlOptions} from "ngx-owl-carousel-o";
import {TIPOS_COMERCIAL, TIPOS_RESIDENCIAL} from "../core/constants/tipos";
import {getFormattedPrice, toArea, toBath, toDormis, toSalas, toVaga} from "../core/utils/imovel.util";
import {CustomSearchComponent} from "../core/components/custom-search/custom-search.component";
import {CustomSearchType} from "../core/components/custom-search/custom-search.enum";

@Component({
  selector: 'app-imoveis',
  templateUrl: './imoveis.component.html',
  styleUrls: ['./imoveis.component.css']
})
export class ImoveisComponent implements OnInit, AfterViewInit {

  pages = 0;
  currentPage = 1;

  showExtraFilter = false;

  noResults = false;

  private itensPerPage = 10;

  MASKS = MASKS;

  imoveis: Imovel[] = [];
  allImoveis: Imovel[] = [];

  simpleSearch: string;

  locais: any[];

  badges = [];

  queryParams: any = {};

  mySlideOptions: OwlOptions = {
    items: 1, dots: true, nav: false, navText: ['<', '>'],
    // responsive: {}
  };

  // customSearch: any;

  /// filtro

  filtred: any[] = [];


  autocompletes: string[] = [];

  // options: Options = {
  //   floor: 0,
  //   ceil: this.customSearch.precos.max,
  //   translate: (value: number): string => {
  //     return formatCurrency(value, 'pt-BR', 'R$', 'BRL');
  //   }
  // };

  // optionsArea: Options = {
  //   floor: 0,
  //   ceil: this.customSearch.area.max,
  //   translate: (value: number): string => {
  //     return value + ' M²';
  //   }
  // };

  removeParams: any[] = [];

  letter1: string;
  letter2: string;
  letterIndexes: number[] = [];

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

  // open(content) {
  //   this.modalService.open(content, {
  //     ariaLabelledBy: 'modal-basic-title',
  //     // @ts-ignore
  //     size: 'xl',
  //     scrollable: false,
  //     centered: true,
  //     windowClass: 'InternalModalFilter'
  //   }).result.then((result) => {
  //     if (result) {
  //       this.dropDownChange(false);
  //     }
  //   }, (reason) => {
  //
  //   });
  // }

  ngOnInit() {


  }

  queryChange(p) {
    console.log(p);
    this.queryParams = p;
    this.customSearch.customSearch.categoria = this.queryParams.categoria || 'comprar',
      this.customSearch.customSearch.salas = this.queryParams.salas || 0,
      this.customSearch.customSearch.garagem = this.queryParams.garagem || 0 ,
      this.customSearch.customSearch.dormitorios = this.queryParams.dormitorios || 0,
      this.customSearch.customSearch.banheiros = this.queryParams.banheiros || 0,
      this.customSearch.customSearch.cidade = this.queryParams.cidade || '',
      this.customSearch.customSearch.bairros = this.queryParams.bairros || '',
      this.customSearch.customSearch.tipos = this.queryParams.tipos || '',
      this.customSearch.customSearch.precos = this.queryParams.precos || ''
    if (this.queryParams.finalidade) {
      this.customSearch.customSearch.finalidade = this.queryParams.finalidade;
    }
    this.customSearch.customSearch.page = this.queryParams.page || 1;
    this.currentPage = parseInt(localStorage.getItem(location.search) || '1');
    this.buildBadges();
    this.loadDefaults();
    this.getImoveis();

  }

  openFilter() {
    this.customSearch.type = CustomSearchType.complex;
    this.customSearch.showMe = true;
  }

  goImovel(imovel: Imovel) {
    localStorage.setItem('nextscroll', String(window.scrollY));
    this.router.navigate(['/imoveis/' + imovel.sigla]).then();
  }

  ngAfterViewInit(): void {
  }


  badgeClose(param: any) {

    param.split(',')
    this.removeParams.push({
      query: param.split(',')[0],
      label: param.split(',').length > 1 ? param.split(',')[1] : null
    });
    // this.dropDownChange(false);

  }

  changePage(page: any) {
    if (this.currentPage + page <= 0) {
      return;
    }
    this.scrollTop();
    this.currentPage = page;
    this.customSearch.customSearch.page = page;
    this.makePagination();
    localStorage.setItem(location.search, page.toString());
  }


  private checkResults() {
    if (!this.imoveis || this.imoveis.length === 0) {
      this.noResults = true;
    } else if (this.imoveis.length === 1 && Object.keys(this.queryParams).length === 1 && this.queryParams.query) {
      this.router.navigateByUrl('/imoveis/' + this.imoveis[0].sigla).then();
    } else {
      this.noResults = false;
    }

  }

  imagensCarousel(images: string[]) {
    return _.slice(images, 0, 4);
  }

  doSimpleSearch() {
    if (this.simpleSearch?.length > 0) {
      this.router.navigate(['imoveis'], {
        queryParams: {
          query: this.simpleSearch
        }
      }).then(value => {
        this.getImoveis({
          query: this.simpleSearch
        })
      }).catch(reason => console.error(reason));
    }
  }


  private scrollTop() {
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }


  getprice(imovel: Imovel): string {
    if (!imovel) {
      return '?';
    }
    try {
      if (this.queryParams.categoria === 'comprar') {
        if (imovel.comercializacao.venda && imovel.comercializacao.venda.ativa) {
          return this.getFormattedPrice(imovel.comercializacao.venda.preco);
        }
      } else if (this.queryParams.categoria === 'alugar') {
        if (imovel.comercializacao.locacao && imovel.comercializacao.locacao.ativa) {
          return this.getFormattedPrice(imovel.comercializacao.locacao.preco);
        }
      } else {
        if (imovel.comercializacao.locacao && imovel.comercializacao.locacao.ativa) {
          return this.getFormattedPrice(imovel.comercializacao.locacao.preco);
        } else if (imovel.comercializacao.venda && imovel.comercializacao.venda.ativa) {
          return this.getFormattedPrice(imovel.comercializacao.venda.preco);
        }
      }
    } catch (e) {
      // console.error(e);
    }
    return '?';
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
      this.badges.push(this.badge(this.queryParams.categoria, 'categoria'));
    }

    if (this.queryParams.finalidade) {
      this.badges.push(this.badge(this.queryParams.finalidade, 'finalidade'));
    }

    if (this.queryParams?.bairros) {
      const ss = typeof this.queryParams?.bairros?.split  === "function" ? (this.queryParams?.bairros?.split(',') || []) : this.queryParams?.bairros;
      ss.forEach(b => this.badges.push(this.badge(`No bairro: ${b}`, `bairros,${b}`)));
    }

    if (this.queryParams.cidade) {
      this.badges.push(this.badge(`Na cidade de ${this.queryParams.cidade}`, 'cidade'));
    }

    if (this.queryParams.dormitorios) {
      const n = Number(this.queryParams.dormitorios);
      if (n === 1) {
        this.badges.push(this.badge(`Com ${n} dormitório`, 'dormitorios'));
      } else if (n === 4) {
        this.badges.push(this.badge(`Com ${n} ou mais dormitórios`, 'dormitorios'));
      } else if (n !== 0) {
        this.badges.push(this.badge(`Com ${n}  dormitórios`, 'dormitorios'));
      }

    }

    if (this.queryParams.banheiros) {
      const n = Number(this.queryParams.banheiros);
      if (n === 1) {
        this.badges.push(this.badge(`Com ${n} banheiro`, 'banheiros'));
      } else if (n === 4) {
        this.badges.push(this.badge(`Com ${n} ou mais banheiros`, 'banheiros'));
      } else if (n !== 0) {
        this.badges.push(this.badge(`Com ${n}  banheiros`, 'banheiros'));
      }

    }


    if (this.queryParams.garagem) {
      const n = Number(this.queryParams.garagem);
      if (n === 1) {
        this.badges.push(this.badge(`Com ${n} vaga de garagem`, 'garagem'));
      } else if (n === 4) {
        this.badges.push(this.badge(`Com ${n} ou mais vagas de garagem`, 'garagem'));
      } else if (n !== 0) {
        this.badges.push(this.badge(`Com ${n}  vagas de garagem`, 'garagem'));
      }

    }

    if (this.queryParams.tipos) {
      const ss = typeof this.queryParams?.tipos?.split  === "function" ? (this.queryParams?.tipos?.split(',') || []) : this.queryParams?.tipos;
      ss.forEach(b => this.badges.push(this.badge(`Tipo: ${b}`, `tipo,${b}`)));
    }

    if (this.queryParams.precos instanceof String) {
      console.log(this.queryParams.precos);
      const ss = this.queryParams.precos.split(',');


      const pMin = Number(ss[0]);
      const pMax = Number(ss[1]);

      // if (pMin !== this.minPrice || pMax !== this.maxPrice) {
      if (pMin !== 0 || pMax !== 4000000) {
        const spMin = formatCurrency(Number(ss[0]), 'pt-BR', 'R$', 'BRL');
        const spMax = formatCurrency(Number(ss[1]), 'pt-BR', 'R$', 'BRL');
        this.badges.push(this.badge(`Entre: ${spMin} e ${spMax}`, 'precos'));
      }
    }
  }

  private badge(s: string, query: string): any {
    return {label: s, query};
  }

  softParamSearch(event: any) {
    console.log(event)
    this.getImoveis(event);
  }
  searchAutocomplete(event: any) {
    const datalist = document.querySelector('datalist');
    if (this.simpleSearch.length > 3) {
      datalist.id = 'dynmicUserIds';
    } else {
      datalist.id = '';
    }

  }

  private loadDefaults() {
    docSnapshots(doc(this.firestore, `${PATH_AUTOCOMPLETE}/${PATH_AUTOCOMPLETE}`))
      .pipe(map((a) => {
        return a.data();
      }))
      .subscribe(strings => {
        this.autocompletes = strings.autocomplete;
      });
  }

  private getImoveis(query?: any, last?: Imovel) {
    console.log(query);
    this.all.getImoveis(query || this.customSearch?.customSearch, last)
      .subscribe((value) => {
        this.allImoveis = value as Imovel[];
        this.pages = this.allImoveis?.length || 0;
        this.makePagination();
        if (this.queryParams.query) {
          const findBySigla = this.imoveis.find(value1 => value1.sigla === this.queryParams.query);
          if (findBySigla) {
            this.goImovel(findBySigla);
          }
        }
        this.checkResults();
        setTimeout(() => {
          window.scrollTo(0, parseInt(localStorage.getItem('nextscroll')));
          localStorage.removeItem('nextscroll');
        }, 500);
      });
  }

  private makePagination() {
    this.imoveis = _.slice(this.allImoveis, 10 * (this.currentPage - 1), 10 * (this.currentPage - 1) + 10);
  }

}
