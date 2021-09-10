import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Imovel} from './models/imovel.model';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {Options} from 'ng5-slider';
import {formatCurrency} from '@angular/common';
import {NgbDropdownConfig, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AngularFireDatabase, SnapshotAction} from "@angular/fire/compat/database";
import {AllImoveis} from "../all-imoveis.service";
import {remove as removeAccents} from 'remove-accents';
import {MASKS, NgBrazilValidators} from 'ng-brazil';

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

  badges = [];

  queryParams: any;

  mySlideOptions = {items: 1, dots: true, nav: false};
  myCarouselOptions = {items: 3, dots: true, nav: true};


  /// filtro

  customSearch: { dormitorios: number | undefined; precos: { min: number; max: number }; area: { min: number; max: number }; salas: any; cidade: string; banheiros: any; finalidade: any; categoria: any; garagem: any; tipos: any; bairros: any[], page: number } = {
    categoria: 'comprar',
    finalidade: 'residencial',
    salas: 2,
    garagem: 0,
    dormitorios: 0,
    banheiros: 0,
    tipos: [],
    precos: {
      min: 0,
      max: 4000000,
    },
    area: {
      min: 0,
      max: 61000,
    },
    bairros: [],
    cidade: '',
    page: 1
  };

  filtred: any[] = [];

  cidades: string[] = [];
  bairrosSelecionados: any[] = [];

  autocompletes: string[] = [];

  options: Options = {
    floor: 0,
    ceil: this.customSearch.precos.max,
    translate: (value: number): string => {
      return formatCurrency(value, 'pt-BR', 'R$', 'BRL');
    }
  };

  optionsArea: Options = {
    floor: 0,
    ceil: this.customSearch.area.max,
    translate: (value: number): string => {
      return value + ' M²';
    }
  };

  removeParams: any[] = [];

  constructor(private route: ActivatedRoute, private ngxService: NgxUiLoaderService, private all: AllImoveis,
              private router: Router, private modalService: NgbModal, private db: AngularFireDatabase, private config: NgbDropdownConfig) {
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      // @ts-ignore
      size: 'xl',
      scrollable: false,
      centered: true,
      windowClass: 'InternalModalFilter'
    }).result.then((result) => {
      if (result) {
        this.dropDownChange(false);
      }
    }, (reason) => {

    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;


      this.customSearch.categoria = this.queryParams.categoria || 'comprar';
      this.customSearch.salas = this.queryParams.salas || 0;
      this.customSearch.garagem = this.queryParams.garagem || 0 ,
        this.customSearch.dormitorios = this.queryParams.dormitorios || 0,
        this.customSearch.banheiros = this.queryParams.banheiros || 0,
        this.customSearch.cidade = this.queryParams.bairro || ''
      if (this.queryParams.finalidade) {
        this.customSearch.finalidade = this.queryParams.finalidade;
      }
      this.customSearch.page = this.queryParams.page || 1;
      this.currentPage = parseInt(localStorage.getItem(location.search) || '1');
      this.buildBadges();

      this.all.getAll(() => {
        this.getImoveis()
        this.ngxService.stopAll();
        this.ngxService.stop();
        this.loadDefaults();
      });


    });


  }

  ngAfterViewInit(): void {
  }


  categoriaCheckboxChange(categoria: string) {
    this.customSearch.categoria = categoria;
    this.rebuildFilter(false);
  }

  changeFinalidade(event: any, finalidade: string) {
    this.customSearch.finalidade = finalidade;
    this.rebuildFilter(false);
  }


  badgeClose(param: any) {

    param.split(',')
    this.removeParams.push({
      query: param.split(',')[0],
      label: param.split(',').length > 1 ? param.split(',')[1] : null
    });
    this.dropDownChange(false);

  }

  dropDownChange(event: boolean) {

    if (!event) {
      let querys = this.removeParams.map(value => value.query);
      let tipos = [];
      tipos = this.customSearch.tipos.filter(value => {
        return value.selected === true && !this.removeParams.filter(value => value.query === 'tipo').map(value => value.label).includes(value.key);
      }).map(value => {
        return value.key;
      });
      let bairros = [];
      bairros = this.customSearch.bairros.filter(value => {
        return value.selected === true && !this.removeParams.filter(value => value.query === 'bairros').map(value => value.label).includes(value.key);
      }).map(value => {
        return value.key;
      });
      let area: string;
      if (!querys.includes('area')) {
        if (this.customSearch.area.min) {
          this.customSearch.area.min = parseInt(this.customSearch.area.min.toString()
            .replace('R$ ', '').replace('.', '')
            .replace(',', '.'));
        }
        if (this.customSearch.area.max) {
          this.customSearch.area.max = parseInt(this.customSearch.area.max.toString()
            .replace('R$ ', '').replace('.', '')
            .replace(',', '.'));
        }
        area = this.customSearch.area.min + ',' + this.customSearch.area.max;
      }
      let precos: string;
      if (!querys.includes('precos')) {
        console.log(this.customSearch.precos.min);

        if (this.customSearch.precos.min) {
          this.customSearch.precos.min = parseInt(this.customSearch.precos.min.toString()
            .replace('R$ ', '').replace('.', '')
            .replace(',', '.'));
        }
        if (this.customSearch.precos.max) {
          this.customSearch.precos.max = parseInt(this.customSearch.precos.max.toString()
            .replace('R$ ', '').replace('.', '')
            .replace(',', '.'));
        }
        console.log(this.customSearch.precos.max);
        precos = this.customSearch.precos.min + ',' + this.customSearch.precos.max;
      }
      console.log(this.customSearch);
      console.log(querys);
      this.search({
        finalidade: !querys.includes('finalidade') ? this.customSearch.finalidade : '',
        tipo: tipos.join(','),
        categoria: !querys.includes('categoria') ? this.customSearch.categoria : '',
        precos,
        area,
        custom: true,
        dormitorios: !querys.includes('dormitorios') ? (this.customSearch.dormitorios > 0 ? this.customSearch.dormitorios : '') : '',
        garagem: !querys.includes('garagem') ? (this.customSearch.garagem > 0 ? this.customSearch.garagem : '') : '',
        banheiros: !querys.includes('banheiros') ? (this.customSearch.banheiros > 0 ? this.customSearch.banheiros : '') : '',
        salas: !querys.includes('salas') ? (this.customSearch.salas > 0 ? this.customSearch.salas : '') : '',
        bairros: bairros.join(','),
        cidade: !querys.includes('cidade') ? this.customSearch.cidade : '',
        page: this.customSearch.page
      });
    }
  }


  search(query) {
    this.removeParams = [];
    if (query) {
      this.router.navigate(['imoveis'], {
        queryParams: query
      });
    }
  }

  changePage(page: number) {
    this.currentPage = page;
    this.customSearch.page = this.currentPage;
    localStorage.setItem(location.search, page.toString());
    this.getImoveis();
  }

  private filterAll() {

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
          // if(values[1] === this.maxPrice) values[1] = 999999999;
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

      // banheiros
      if (this.queryParams.banheiros && this.queryParams.banheiros > 0) {
        if (imovel.numeros && imovel.numeros.banheiros && imovel.numeros.banheiros === Number(this.queryParams.banheiros)) {
          f.push('t');
        } else {
          f.push('f');
        }
      }

      // garagem
      if (this.queryParams.garagem && this.queryParams.garagem > 0) {
        if (imovel.numeros && imovel.numeros.vagas && imovel.numeros.vagas === Number(this.queryParams.garagem)) {
          f.push('t');
        } else {
          f.push('f');
        }
      }

      if (this.queryParams.query) {
        if (imovel.sigla.toLocaleUpperCase() === this.queryParams.query.toLocaleUpperCase()) {
          f.push('t');
        } else if (imovel.local && imovel.local.bairro && removeAccents(imovel.local.bairro.toLocaleLowerCase()).search(removeAccents(this.queryParams.query.toLocaleLowerCase())) > -1) {
          f.push('t');
        } else if (imovel.local && imovel.local.cidade && removeAccents(imovel.local.cidade.toLocaleLowerCase()).search(removeAccents(this.queryParams.query.toLocaleLowerCase())) > -1) {
          f.push('t');
        } else {
          f.push('f');
        }
      }

      if (this.queryParams.featured) {
        if (imovel.site && imovel.site.imobiliaria && imovel.site.imobiliaria.destaque && imovel.site.imobiliaria.destaque === true) {
          f.push('t');
        } else {
          f.push('f');
        }
      }

      return !f.includes('f');
    });

    this.pages = filtred.length;
    console.log(this.pages);
    this.imoveis = _.chunk(filtred, this.itensPerPage)[this.currentPage - 1];

    this.checkResults();
    // }, 2000);


  }

  private getImoveis() {
    this.imoveis = [];
    this.pages = 0;

    this.noResults = false;

    this.all.getAll(imoveis => {
      this.allImoveis = imoveis;
      this.filterAll();
      this.checkResults();
      this.rebuildFilter();
    });
  }


  private checkResults() {
    if (!this.imoveis || this.imoveis.length === 0) {
      this.noResults = true;
    } else if (this.imoveis.length === 1 && Object.keys(this.queryParams).length === 1 && this.queryParams.query) {
      this.router.navigateByUrl('/imoveis/' + this.imoveis[0].sigla);
    } else {
      this.noResults = false;
    }

  }

  imagensCarousel(images: string[]) {
    return _.slice(images, 0, 4);
  }


  private scrollTop() {
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  toArea(imovel: Imovel) {
    if (imovel) {
      try {
        if (imovel && imovel.tipo === 'casa') {
          return imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
        } else if (imovel && imovel.tipo === 'apartamento' || imovel.tipo === 'sala' || imovel.tipo === 'cobertura') {
          return imovel.numeros.areas.util.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
        } else if (imovel && imovel.tipo === 'terreno') {
          return imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
        } else if (imovel && imovel.tipo === 'chácara') {
          return imovel.numeros.areas.terreno.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
        } else if (imovel && imovel.tipo === 'galpão') {
          return imovel.numeros.areas.construida.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
        } else if (imovel && imovel.tipo === 'prédio') {
          return imovel.numeros.areas.construida.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
        }
      } catch (e) {
        // console.error(e);
      }
    }
    return null;
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

  toSalas(imovel: Imovel) {
    if (!imovel) {
      return '?';
    }
    try {
      if (imovel && (imovel.tipo === 'sala' || imovel.tipo === 'prédio')) {
        return imovel.numeros.salas;
      } else if (imovel) {
        return imovel.numeros.salas;
      }
    } catch (e) {
      // console.error(e);
    }
    return '?';
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

  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(price).replace(',00', '');
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

    if (this.queryParams.bairros) {
      const ss = this.queryParams.bairros.split(',');
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

    if (this.queryParams.tipo) {
      const ss = this.queryParams.tipo.split(',');
      ss.forEach(b => this.badges.push(this.badge(`Tipo: ${b}`, `tipo,${b}`)));
    }

    if (this.queryParams.precos) {
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

  // fitros metodes


  changeCidade(cidade: string) {
    this.customSearch.cidade = cidade;
    this.buildLocaisBairros(cidade);
  }

  changeTipo(event: any, i: number) {
    this.customSearch.tipos[i].selected = event.currentTarget.checked;
  }

  changeBairro(event: any, i: number) {
    this.customSearch.bairros[i].selected = event.currentTarget.checked;
    this.bairrosSelecionados = this.customSearch.bairros.filter(value => {
      return value.selected === true;
    }).map(value => {
      return value.key;
    });
  }


  private loadDefaults() {

    this.db.list('area').snapshotChanges().subscribe((action: SnapshotAction<{}>[]) => {
      action.forEach(value => {
        if (value.key === 'min') {
          this.customSearch.area.min = value.payload.val() as number;

        } else if (value.key === 'max') {
          this.customSearch.area.max = value.payload.val() as number;

        }
      })
    });

    this.db.list('precos').snapshotChanges().subscribe((action: SnapshotAction<{}>[]) => {
      action.forEach(value => {
        if (value.key === 'min') {
          this.customSearch.precos.min = value.payload.val() as number;
        } else if (value.key === 'max') {
          this.customSearch.precos.max = value.payload.val() as number;
        }
      });
    });
  }


  buildLocaisBairros(cidade: string) {
    this.customSearch.bairros = [];
    _.union(_.compact(_.map(this.filtred, (im: Imovel, key) => {
      if (_.get(im, "local.cidade") === cidade) {
        return im.local.bairro;
      }
      return null;
    }))).forEach((value, index) => {
      let selected = false;
      if (this.queryParams.bairros) {
        const find = this.queryParams.bairros.split(',').find(value1 => {
          return value1 === value;
        });
        if (find) {
          selected = true;
        }
      }

      this.customSearch.bairros.push({key: value, selected: selected, i: index, c: cidade});
    });

    this.customSearch.bairros.sort((a, b) => {
      if (a.key < b.key) {
        return -1;
      }
      if (a.key > b.key) {
        return 1;
      }
      return 0;
    });

    this.setMarkers();


  }

  letter1: string;
  letter2: string;
  letterIndexes: number[] = [];

  showMakerLetter(bairro: string, index: number) {
    return this.letterIndexes.includes(index);

  }

  firstMakerLetter(bairro: string) {
    return bairro.charAt(0);

  }

  setMarkers() {
    this.letter1 = null;
    this.letter2 = null;
    this.letterIndexes = [];
    this.customSearch.bairros.forEach((bairro, index) => {
      this.letter1 = bairro.key.charAt(0);
      if (this.letter1 !== this.letter2) {
        this.letterIndexes.push(index);
        this.letter2 = this.letter1;
      }
    });

  }


  rebuildFilter(event?: any) {

    if (!this.allImoveis) return;

    this.filtred = this.allImoveis.filter((imovel: Imovel) => {
      let add = false;
      if (this.customSearch.categoria === 'comprar' && _.get(imovel, "comercializacao.venda.ativa")) {
        add = true;
      }
      if (this.customSearch.categoria === 'alugar' && _.get(imovel, "comercializacao.locacao.ativa")) {
        add = true;
      }

      if (!add) return add;

      if (this.customSearch.finalidade === 'residencial' && imovel.finalidade !== 'residencial') {
        add = false;
      }
      if (this.customSearch.finalidade === 'comercial' && imovel.finalidade !== 'comercial') {
        add = false;
      }

      return add;
    });


    this.customSearch.tipos = [];
    this.cidades = [];

    this.filtred.forEach((im: Imovel, i: number) => {
      this.cidades.push(im.local.cidade);
      if (i === 0) {
        this.buildLocaisBairros(im.local.cidade);
      }
    });


    _.union(_.compact(_.map(this.filtred, (im: Imovel, key) => {
      return im.tipo;
    }))).forEach((value, index) => {
      let selected = false;
      if (this.queryParams.tipo) {
        const find = this.queryParams.tipo.split(',').find(value1 => {
          return value1 === value;
        });
        if (find) {

          selected = true;
        }
      }
      this.customSearch.tipos.push({key: value, selected: selected, i: index});
    });

    this.cidades = _.union(this.cidades)
  }


}
