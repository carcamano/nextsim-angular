import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup} from '@angular/forms';
import {GeneralService} from '../imoveis/general.service';
import {HttpResponse} from '@angular/common/http';
import {Imovel} from '../imoveis/models/imovel.model';
import {Options} from 'ng5-slider';
import * as _ from 'lodash';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {formatCurrency} from '@angular/common';
import {AngularFireDatabase, DatabaseSnapshot, SnapshotAction} from "@angular/fire/database";
import {Observable} from "rxjs";

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

  tipos_residencial = [];
  tipos_comercial = [];
  locais: any;
  locais_residencial: any;
  locais_comercial: any;

  locaisGeral: string[];
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

  constructor(private router: Router, private modalService: NgbModal, private db: AngularFireDatabase, private ngxService: NgxUiLoaderService) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url.includes('/imoveis')) {
        this.rootView = false;
        this.simpleSearch = {
          finalidade: null,
          categoria: null,
          campo: null
        };
      } else if (event instanceof NavigationEnd && (event.url.includes('/sobre-nos') || event.url.includes('/quero-negociar'))) {
        this.rootView = false;
      } else if (event instanceof NavigationEnd && !event.url.includes('/imoveis')) {
        this.rootView = true;
      }
      this.showMobileMenu = false;
      this.loadDefaults();
    });
  }

  ngOnInit() {
    this.loadDefaults();
    this.db.list('autocomplete').snapshotChanges().subscribe((action: any[]) => {
      action.forEach((value: SnapshotAction<any[]>) => {
        this.autocompletes.push(value.payload.val().toString())

      })
    });
  }


  open(content) {
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
      this.locais = this.locais_residencial;
    } else {
      this.customSearch.tipos = this.tipos_comercial;
      this.locais = this.locais_comercial;
    }
    this.buildLocais();
  }


  private loadDefaults() {
    this.db.list('tipos_residencial').snapshotChanges().subscribe((action: any[]) => {
      this.customSearch.tipos = [];
      this.tipos_residencial = action.map((value:SnapshotAction<any[]>, index, array) => {
        return {key: value.payload.val(), selected: false, i: index};
      });
      this.customSearch.tipos = this.tipos_residencial;
    });

    this.db.list('tipos_comercial').snapshotChanges().subscribe((action: any[]) => {
      this.tipos_comercial = action.map((value:SnapshotAction<any[]>, index, array) => {
        return {key: value.payload.val(), selected: false, i: index};
      });
    });

    this.db.list('locais_residencial').snapshotChanges().subscribe((action: any[]) => {
      if (!this.locais_residencial) {
        this.locais_residencial = action.map((value:SnapshotAction<any[]>) => value.payload.val());
        this.locais = this.locais_residencial;
        this.buildLocais();

      }
    });

    this.db.list('locais_comercial').snapshotChanges().subscribe((action: any[]) => {
      if (!this.locais_comercial) {
        this.locais_comercial = action.map((value:SnapshotAction<any[]>) => value.payload.val());
      }
    });

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


  buildLocais() {
    this.locaisGeral = [];
    _.forIn(this.locais, (value, key) => {
      this.locaisGeral.push(key);
    });
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
