import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Imovel} from './models/imovel.model';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {DecimalPipe, formatCurrency} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AllImoveis} from "../core/services/all-imoveis.service";
import {MASKS} from 'ng-brazil';
import {doc, docSnapshots, Firestore} from "@angular/fire/firestore";
import {PATH_AUTOCOMPLETE} from "../core/utils/constants.util";
import {map} from "rxjs/operators";
import {OwlOptions} from "ngx-owl-carousel-o";
import {getFormattedPrice, toArea, toBath, toDormis, toSalas, toVaga} from "../core/utils/imovel.util";
import {CustomSearchComponent} from "../core/components/custom-search/custom-search.component";
import {CustomSearchType} from "../core/components/custom-search/custom-search.enum";

// LOCAL STORAGE
const nextscroll = 'nextscroll';
const nextLastAllImoveis = 'nextLastAllImoveis';
const nextLastImoveis = 'nextLastImoveis';
const nextQueryParams = 'nextQueryParams';

@Component({
  selector: 'app-imoveis',
  templateUrl: './imoveis.component.html',
  styleUrls: ['./imoveis.component.scss']
})
export class ImoveisComponent implements OnInit, AfterViewInit {

  pages = 0;
  currentPage = 1;

  showExtraFilter = false;

  initializeResults = false;

  private itensPerPage = 10;

  MASKS = MASKS;

  imoveis: Imovel[] = [];
  allImoveis: Imovel[] = [];

  simpleSearch: string;

  locais: any[];

  badges = [];

  queryParams: any = {};

  breadcrumbTitle: string = null;

  mySlideOptions: OwlOptions = {
    items: 1, dots: true, nav: false, navText: ['<', '>'],
  };


  filtred: any[] = [];


  autocompletes: any[] = [];
  autocompleteSelected: any = null;


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


  ngOnInit() {
    this.loadDefaults();
  }

  queryChange(p) {
    console.log(p);
    this.queryParams = p;
    this.customSearch.customSearch.categoria = this.queryParams?.categoria || 'comprar',
      this.customSearch.customSearch.salas = this.queryParams?.salas || 0,
      this.customSearch.customSearch.garagem = this.queryParams?.garagem || 0 ,
      this.customSearch.customSearch.dormitorios = this.queryParams?.dormitorios || 0,
      this.customSearch.customSearch.banheiros = this.queryParams?.banheiros || 0,
      this.customSearch.customSearch.cidade = this.queryParams?.cidade || '',
      this.customSearch.customSearch.bairros = this.queryParams?.bairros || '',
      this.customSearch.customSearch.tipos = _.isArray(this.queryParams?.tipos) ? this.queryParams?.tipos : (this.queryParams?.tipos ? [this.queryParams?.tipos] : ''),
      this.customSearch.customSearch.precos = this.queryParams?.precos || ''
    if (this.queryParams.finalidade) {
      this.customSearch.customSearch.finalidade = this.queryParams?.finalidade;
    }
    this.customSearch.customSearch.page = this.queryParams?.page || 1;
    this.currentPage = parseInt(localStorage.getItem(location.search) || '1');
    this.buildBadges();
    this.getImoveis();
    this.scrollTop();

  }

  openFilter() {
    this.customSearch.type = CustomSearchType.complex;
    this.customSearch.showMe = true;
  }

  goImovel(imovel: Imovel) {
    localStorage.setItem(nextscroll, String(window.scrollY));
    localStorage.setItem(nextLastAllImoveis, JSON.stringify(this.allImoveis));
    localStorage.setItem(nextLastImoveis, JSON.stringify(this.imoveis));
    localStorage.setItem(nextQueryParams, JSON.stringify(this.queryParams));
    console.log(this.imoveis);
    this.router.navigate(['/imoveis/' + imovel.sigla]).then();
  }

  ngAfterViewInit(): void {
    console.log(localStorage.getItem(nextLastAllImoveis));
    if (localStorage.getItem(nextLastAllImoveis)) {
      this.allImoveis = JSON.parse(localStorage.getItem(nextLastAllImoveis));
      this.imoveis = JSON.parse(localStorage.getItem(nextLastImoveis));
    }
    localStorage.removeItem(nextLastAllImoveis);
    localStorage.removeItem(nextLastImoveis);
    console.log(this.allImoveis);
    this.route.data.subscribe(data => {
      console.log(data);
      if (data?.breadcrumbTitle) {
        this.breadcrumbTitle = data.breadcrumbTitle;
      } else {
        this.breadcrumbTitle = null;
      }
    });
  }


  badgeClose(param: any) {
    const ss = param.split(',');
    if (ss?.length > 0) {
      switch (ss[0]) {
        case 'categoria':
          this.customSearch.customSearch.categoria = null;
          break;
        case 'finalidade':
          this.customSearch.customSearch.categoria = null;
          break;
        case 'bairros':
          this.customSearch.bairrosSelecionados = this.customSearch.bairrosSelecionados.filter(value1 => value1 !== ss[1]);
          break;
        case 'cidade':
          this.customSearch.customSearch.cidade = null;
          break;
        case 'dormitorios':
          this.customSearch.customSearch.dormitorios = 0;
          break;
        case 'banheiros':
          this.customSearch.customSearch.banheiros = 0;
          break;
        case 'garagem':
          this.customSearch.customSearch.garagem = 0;
          break;
        case 'tipo':
          this.customSearch.tiposSelecionados = this.customSearch.tiposSelecionados.filter(value1 => value1 !== ss[1]);
          break;
        case 'precos':
          this.customSearch.customSearch.precos = {
            min: null,
            max: null,
          };
          break;
        case 'area':
          this.customSearch.customSearch.area = {
            min: null,
            max: null,
          };
          break;

      }
    }


    // @ts-ignore
    this.customSearch?.forceSearch = !this.customSearch?.forceSearch;
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
    if ((!this.imoveis || this.imoveis.length === 0) && (!this.allImoveis || this.allImoveis.length === 0)) {
    } else if (this.imoveis.length === 1 && Object.keys(this.queryParams).length === 1 && this.queryParams.query) {
      this.router.navigateByUrl('/imoveis/' + this.imoveis[0].sigla).then();
    }

  }

  imagensCarousel(images: string[]) {
    return _.slice(images, 0, 4);
  }

  doSimpleSearch() {
    if (this.simpleSearch?.length > 0) {
      if (this.autocompleteSelected?.type === 'sigla') {
        this.router.navigate(['imoveis', this.autocompleteSelected?.value]).then();
      } else {
        this.router.navigate(['imoveis'], {
          queryParams: {
            query: this.simpleSearch,
            autocomplete: this.autocompleteSelected?.type
          }
        }).then();
      }
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
    }
    return '?';
  }

  buildBadges() {
    if (localStorage.getItem(nextQueryParams)) {
      this.queryParams = JSON.parse(localStorage.getItem(nextQueryParams));
    }
    localStorage.removeItem(nextQueryParams);
    this.badges = [];
    if (this.queryParams.categoria) {
      // this.badges.push(this.badge(this.queryParams.categoria, 'categoria'));
    }

    if (this.queryParams.finalidade) {
      // this.badges.push(this.badge(this.queryParams.finalidade, 'finalidade'));
    }

    if (this.queryParams?.bairros) {
      const ss = typeof this.queryParams?.bairros?.split === "function" ? (this.queryParams?.bairros?.split(',') || []) : this.queryParams?.bairros;
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
      const ss = typeof this.queryParams?.tipos?.split === "function" ? (this.queryParams?.tipos?.split(',') || []) : this.queryParams?.tipos;
      ss.forEach(b => this.badges.push(this.badge(`Tipo: ${b}`, `tipo,${b}`)));
    }

    if (this.queryParams.precos?.min || this.queryParams.precos?.max) {
      if (this.queryParams.precos?.min && this.queryParams.precos?.max) {
        const spMin = formatCurrency(Number(this.queryParams.precos?.min), 'pt-BR', 'R$', 'BRL');
        const spMax = formatCurrency(Number(this.queryParams.precos?.max), 'pt-BR', 'R$', 'BRL');
        this.badges.push(this.badge(`Entre: ${spMin} e ${spMax}`, 'precos'));
      } else if (this.queryParams.precos?.min) {
        const spMin = formatCurrency(Number(this.queryParams.precos?.min), 'pt-BR', 'R$', 'BRL');
        this.badges.push(this.badge(`Preço maior que ${spMin}`, 'precos'));
      } else if (this.queryParams.precos?.max) {
        const spMax = formatCurrency(Number(this.queryParams.precos?.max), 'pt-BR', 'R$', 'BRL');
        this.badges.push(this.badge(`Preço manor que ${spMax}`, 'precos'));
      }
    }

    if (this.queryParams.area?.min || this.queryParams.area?.max) {
      if (this.queryParams.area?.min && this.queryParams.area?.max) {
        const spMin = new DecimalPipe('pt-BR').transform(this.queryParams.area?.min);
        const spMax = new DecimalPipe('pt-BR').transform(this.queryParams.area?.max);
        this.badges.push(this.badge(`Com área entre: ${spMin} m² e ${spMax} m²`, 'area'));
      } else if (this.queryParams.area?.min) {
        const spMin = new DecimalPipe('pt-BR').transform(this.queryParams.area?.min);
        this.badges.push(this.badge(`Área maior que ${spMin} m²`, 'area'));
      } else if (this.queryParams.area?.max) {
        const spMax = new DecimalPipe('pt-BR').transform(this.queryParams.area?.max);
        this.badges.push(this.badge(`Área manor que ${spMax} m²`, 'area'));
      }
    }

  }

  private badge(s: string, query: string): any {
    return {label: s, query};
  }

  softParamSearch(event: any) {
    console.log(event);
    if (event.autocomplete) {
      switch (event.autocomplete) {
        case 'bairro':
          this.all.getImoveisByBairro(event.query)
            .subscribe((value) => {
              this.makeResults(value as Imovel[]);
            });
          break;
        case 'cidade':
          this.all.getImoveisByCidade(event.query + '/SP')
            .subscribe((value) => {
              this.makeResults(value as Imovel[], event);
            });
          break;
      }
    } else if (event.finalidade && event.categoria) {
      this.all.getImoveisByFinalidadeTipo(event.finalidade, event.categoria)
        .subscribe((value) => {
          this.makeResults(value as Imovel[], event);
        });

    } else if (event.destaques) {
      this.all.getImoveisDestaque()
        .subscribe((value) => {
          this.makeResults(value as Imovel[], event);
        });

    }

  }

  searchAutocomplete(event: any) {
    const datalist = document.querySelectorAll('.imoveisDatalist')[0];
    if (this.simpleSearch.length > 3) {
      datalist.id = 'dynmicUserIdsImoveis';
    } else {
      this.autocompleteSelected = null;
      datalist.id = '';
    }

  }

  onSelectAutoComplete(e: any, value: string) {
    this.autocompleteSelected = this.autocompletes.find(item => item.value === value)
  }

  private loadDefaults() {
    docSnapshots(doc(this.firestore, `${PATH_AUTOCOMPLETE}/${PATH_AUTOCOMPLETE}`))
      .pipe(map((a) => {
        return a.data();
      }))
      .subscribe(strings => {
        this.autocompletes = _.unionBy(strings.autocomplete, 'value');
      });
  }

  private getImoveis(query?: any, last?: Imovel) {
    if (!localStorage.getItem(nextLastAllImoveis)) {
      this.all.getImoveis(query || this.customSearch?.customSearch, last)
        .subscribe((value) => {
          this.makeResults(value as Imovel[]);
        });
    } else {
      this.makeResults(this.allImoveis);
    }
  }

  private makeResults(value: Imovel[], event: any = null) {
    if (event && (event.finalidade || event.categoria)) {
      if (event.finalidade) {
        value = _.filter(value, (v) => v.finalidade === event.finalidade);
      }

      if (event.categoria) {
        value = _.filter(value, (v) => event.categoria === 'comprar' ? v.comercializacao?.venda?.ativa : v.comercializacao?.locacao?.ativa);
      }
    }
    this.allImoveis = value;
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

  }

  private makePagination() {
    this.initializeResults = true;
    this.imoveis = _.slice(this.allImoveis, 10 * (this.currentPage - 1), 10 * (this.currentPage - 1) + 10);
  }

}
