import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Imovel} from './models/imovel.model';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {Options} from 'ng5-slider';
import {formatCurrency} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AllImoveis} from "../core/services/all-imoveis.service";
import {remove as removeAccents} from 'remove-accents';
import {MASKS} from 'ng-brazil';
import {collection, collectionData, collectionSnapshots, doc, docSnapshots, Firestore} from "@angular/fire/firestore";
import {PATH_AREA, PATH_AUTOCOMPLETE, PATH_LOCAIS, PATH_PRECOS} from "../core/utils/constants.util";
import {map} from "rxjs/operators";

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

  locais: any[];

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
              private router: Router, private modalService: NgbModal, private firestore: Firestore) {
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

      // this.all.getAll(() => {
      //   this.getImoveis()
      //   this.ngxService.stopAll();
      //   this.ngxService.stop();
      //   this.loadDefaults();
      // });

      this.all.getImoveis(this.customSearch)

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

    collectionData(collection(this.firestore, PATH_AREA))
      .subscribe(value => {
        if (value?.length > 0) {
          this.customSearch.area.min = value[0].min as number;
          this.customSearch.area.max = value[0].max as number;
        }
      });

    collectionData(collection(this.firestore, PATH_PRECOS))
      .subscribe(value => {
        if (value?.length > 0) {
          this.customSearch.area.min = value[0].min as number;
          this.customSearch.area.max = value[0].max as number;
        }
      });

    docSnapshots(doc(this.firestore, `${PATH_AUTOCOMPLETE}/${PATH_AUTOCOMPLETE}`))
      .pipe(map((a) => {
        return a.data();
      }))
      .subscribe(strings => {
        console.log(strings);
        this.autocompletes = strings.autocomplete;
      });

    collectionSnapshots(collection(this.firestore, PATH_LOCAIS))
      .pipe(map((actions) => actions.map((a) => {
        return {id: a.id, ...a.data()}
      })))
      .subscribe(value => {
        this.locais = value;
      })


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
    console.log('rebuildFilter');
    console.log(this.customSearch.categoria);
    console.log(this.customSearch.finalidade);

    this.filtred = this.locais.find(value => {
      return value.id === `${this.customSearch.categoria}_${this.customSearch.finalidade}`;
    });
    console.log(this.filtred);


    this.customSearch.tipos = [];
    this.cidades = [];


    Object.keys(this.filtred).forEach((key: string, i: number) => {
      console.log(key)
      if (key !== 'id') {
        this.cidades.push(key);
      }
    });

    if (this.cidades?.length > 0) {
      this.customSearch.cidade = this.filtred[this.cidades[0]].cidade;
      this.buildLocaisBairros(this.filtred[this.cidades[0]].cidade);
    }


    _.union(_.compact(_.map(this.filtred[this.cidades[0]], (im: any, key) => {
      console.log(im.tipo);
      return im.tipo;
    }))).forEach((value, index) => {
      this.customSearch.tipos.push({key: value, selected: false, i: index});
    });

    console.log(this.customSearch.tipos.length);
    this.cidades = _.union(this.cidades)
    console.log(this.cidades);
  }


}
