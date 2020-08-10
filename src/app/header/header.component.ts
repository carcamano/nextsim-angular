import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {Options} from 'ng5-slider';
import * as _ from 'lodash';
import {formatCurrency} from '@angular/common';
import {AngularFireDatabase, SnapshotAction} from "@angular/fire/database";
import {AllImoveis} from "../all-imoveis.service";
import {Imovel} from "../imoveis/models/imovel.model";
import {LancamentoService} from "../home/lancamento.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  rootView = true;

  imoveis: Imovel[];

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
  image= 'https://admin.nextsim.com.br/wp-content/themes/theme/img/house-bg.jpg';

  constructor(private router: Router, private modalService: NgbModal, private db: AngularFireDatabase, private allImoveis: AllImoveis,
              private lancamentoService: LancamentoService) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url.includes('/imoveis')) {
        this.rootView = false;
        this.simpleSearch = {
          finalidade: null,
          categoria: null,
          campo: null
        };
      } else if (event instanceof NavigationEnd && ((event.url.includes('/sobre-nos') || event.url.includes('/quero-negociar') || event.url.includes('/blog')))) {
        this.rootView = false;
      } else if (event instanceof NavigationEnd && !event.url.includes('/imoveis')) {
        this.rootView = true;
      }
      this.showMobileMenu = false;

    });
  }

  ngOnInit() {
    this.loadDefaults();
    this.db.list('autocomplete').snapshotChanges().subscribe((action: any[]) => {
      action.forEach((value: SnapshotAction<any[]>) => {
        this.autocompletes.push(value.payload.val().toString())

      })
    });


    // ADMIN title
    this.lancamentoService.header().subscribe(value => {
      if(value.acf.texto_home) {

      this.title = value.acf.texto_home;
      }
      if(value.acf.imagem_home) {

      this.image = value.acf.imagem_home;
      }
    })
  }


  open(content) {
    this.allImoveis.getAll((imoveis: Imovel[]) => {
      this.imoveis = imoveis;
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
    });
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


  private loadDefaults() {
    // this.db.list('tipos_residencial').snapshotChanges().subscribe((action: any[]) => {
    //   this.customSearch.tipos = [];
    //   this.tipos_residencial = action.map((value:SnapshotAction<any[]>, index, array) => {
    //     return {key: value.payload.val(), selected: false, i: index};
    //   });
    //   this.customSearch.tipos = this.tipos_residencial;
    // });
    //
    // this.db.list('tipos_comercial').snapshotChanges().subscribe((action: any[]) => {
    //   this.tipos_comercial = action.map((value:SnapshotAction<any[]>, index, array) => {
    //     return {key: value.payload.val(), selected: false, i: index};
    //   });
    // });

    // this.db.list('locais_residencial').snapshotChanges().subscribe((action: any[]) => {
    //   if (!this.locais_residencial) {
    //     this.locais_residencial = action.map((value:SnapshotAction<any[]>) => value.payload.val());
    //     this.locais = this.locais_residencial;
    //     this.buildLocais();
    //
    //   }
    // });
    //
    // this.db.list('locais_comercial').snapshotChanges().subscribe((action: any[]) => {
    //   if (!this.locais_comercial) {
    //     this.locais_comercial = action.map((value:SnapshotAction<any[]>) => value.payload.val());
    //   }
    // });

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
      this.customSearch.bairros.push({key: value, selected: false, i: index, c: cidade});
    });

    console.log(this.customSearch.bairros);
  }


  rebuildFilter(event?: any) {
    this.filtred = this.imoveis.filter((imovel: Imovel) => {
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
        this.customSearch.cidade = im.local.cidade;
        this.buildLocaisBairros(im.local.cidade);
      }
    });


    _.union(_.compact(_.map(this.filtred, (im: Imovel, key) => {
      return im.tipo;
    }))).forEach((value, index) => {
      this.customSearch.tipos.push({key: value, selected: false, i: index});
    });

    this.cidades = _.union(this.cidades)
    console.log(this.cidades);
    console.log(this.filtred);
  }

}
