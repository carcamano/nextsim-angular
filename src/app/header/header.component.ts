import {Component, ElementRef, OnInit, Renderer2, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Options} from 'ng5-slider';
import * as _ from 'lodash';
import {formatCurrency} from '@angular/common';
import {AllImoveis} from "../core/services/all-imoveis.service";
import {Imovel} from "../imoveis/models/imovel.model";
import {WPService} from "../core/services/w-p.service";
import {PATH_AREA, PATH_AUTOCOMPLETE, PATH_LOCAIS, PATH_PRECOS} from "../core/utils/constants.util";
import {Firestore, collectionData, collection, collectionSnapshots, doc, docSnapshots} from '@angular/fire/firestore';
import {map} from "rxjs/operators";
import {TIPOS_COMERCIAL, TIPOS_RESIDENCIAL} from "../core/constants/tipos";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  rootView = true;

  simpleSearch = {
    finalidade: null,
    categoria: null,
    campo: null
  };

  customSearch = {
    categoria: 'comprar',
    finalidade: 'residencial',
    quartos: 0,
    salas: 0,
    dormitorios: 0,
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
    cidade: ''
  };

  filtred: any[] = [];

  cidades: string[] = [];
  bairrosSelecionados: any[] = [];

  autocompletes: string[] = [];

  locais: any[];

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

  showMobileMenu = false;
  modalMobileStep1 = true;
  modalMobileStep2 = false;
  modalMobileStep3 = false;

  mobileMenuAlugar = false;

  title = 'Sua melhor forma de acessar imóveis<br> de alto padrão com suporte.';
  image = 'https://admin.nextsim.com.br/wp-content/themes/theme/img/house-bg.jpg';

  constructor(private router: Router, private modalService: NgbModal, private allImoveis: AllImoveis, private firestore: Firestore,
              private lancamentoService: WPService, private elementRef: ElementRef, private renderer: Renderer2) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url.includes('/imoveis')) {
        this.rootView = false;
        this.simpleSearch = {
          finalidade: null,
          categoria: null,
          campo: null
        };
      } else if (event instanceof NavigationEnd && ((event.url.includes('/sobre-nos') ||
        event.url.includes('/quero-negociar') || event.url.includes('/blog') || event.url.includes('/servicos')))) {
        this.rootView = false;
      } else if (event instanceof NavigationEnd && !event.url.includes('/imoveis')) {
        this.rootView = true;
      }
      this.showMobileMenu = false;

    });
  }

  ngOnInit() {
    this.loadDefaults();


    // ADMIN title
    this.lancamentoService.header().subscribe(value => {
      if (value.acf.texto_home) {

        this.title = value.acf.texto_home;
      }
      if (value.acf.imagem_home) {

        this.image = value.acf.imagem_home;
      }
    })
  }


  open(content) {
    this.rebuildFilter();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      // @ts-ignore
      size: 'xl',
      scrollable: true,
      centered: true
    }).result.then((result) => {
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
    }, (reason) => {

    });
  }

  scroll() {
    document.getElementById('backdrop').scrollIntoView({behavior: "smooth"});
  }

  openSearchMobile(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      // @ts-ignore
      size: 'xl',
      scrollable: false,
      centered: true,
      windowClass: 'MobHomeFilterModal'
    }).result.then((result) => {
      this.search(null);
    }, (reason) => {
    });
  }

  searchAutocomplete(event: any) {
    const datalist = document.querySelector('datalist');
    if (this.simpleSearch.campo.length > 3) {
      datalist.id = 'dynmicUserIds';
    } else {
      datalist.id = '';
    }

  }

  modalStep(step: number) {
    this.modalMobileStep3 = false;
    this.modalMobileStep2 = false;
    this.modalMobileStep1 = false;
    switch (step) {
      case 1:
        this.modalMobileStep1 = true;
        break;
      case 2:
        this.modalMobileStep2 = true;
        break;
      case 3:
        this.modalMobileStep3 = true;
        break;

    }

  }

  search(query) {
    console.log('query');
    console.log(query);
    if (this.simpleSearch.finalidade || this.simpleSearch.categoria || this.simpleSearch.campo || query) {
      this.router.navigate(['imoveis'], {
        queryParams: query || {
          finalidade: this.simpleSearch.finalidade,
          categoria: this.simpleSearch.categoria,
          query: this.simpleSearch.campo
        }
      });
    }
  }


  changeCidade(cidade: string) {
    this.customSearch.cidade = cidade;
    this.buildLocaisBairros(cidade);
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


  buildLocaisBairros(cidade: string) {
    console.log(cidade);
    this.customSearch.bairros = [];

    _.union(_.compact(_.map(this.filtred[cidade], (im: any, key) => {
      return im.bairro;
    }))).forEach((value, index) => {
      this.customSearch.bairros.push({key: value, selected: false, i: index, c: cidade});
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


  rebuildFilter(event?: any) {
    console.log('rebuildFilter');
    console.log(this.locais);
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


    let tipos = [];
    if(this.customSearch.finalidade === 'residencial') {
      tipos = TIPOS_RESIDENCIAL;
    } else {
      tipos = TIPOS_COMERCIAL;
    }
    tipos.forEach((value, index) => {
      this.customSearch.tipos.push({key: value, selected: false, i: index});
    });

    console.log(this.customSearch.tipos.length);
    this.cidades = _.union(this.cidades)
    console.log(this.cidades);
  }

}
