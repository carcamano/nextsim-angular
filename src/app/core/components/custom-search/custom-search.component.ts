import {AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Options} from "ng5-slider";
import {formatCurrency} from "@angular/common";
import * as _ from "lodash";
import {collection, collectionData, collectionSnapshots, doc, docSnapshots, Firestore} from "@angular/fire/firestore";
import {PATH_AREA, PATH_AUTOCOMPLETE, PATH_LOCAIS, PATH_PRECOS} from "../../utils/constants.util";
import {map} from "rxjs/operators";
import {TIPOS_COMERCIAL, TIPOS_RESIDENCIAL} from "../../constants/tipos";
import {NgbDropdown} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute, Router} from "@angular/router";
import {CustomSearchType} from "./custom-search.enum";
import {MatSelectChange} from "@angular/material/select";
import {MASKS, NgBrazilValidators, NgBrDirectives} from 'ng-brazil';
import {currencyToNumber} from "../../utils/imovel.util";
const {CURRENCYPipe} = NgBrDirectives;


@Component({
  selector: 'app-custom-search',
  templateUrl: './custom-search.component.html',
  styleUrls: ['./custom-search.component.scss']
})
export class CustomSearchComponent implements OnInit, AfterViewInit {

  currentStep = 0;

  CustomSearchType = CustomSearchType;
  @Input() type: CustomSearchType = CustomSearchType.simple;

  @ViewChild('myDrop') finalidadeSelector: NgbDropdown;

  autocompletes: string[] = [];

  @Input() showMe = false;

  @Input() customSearch = {
    categoria: 'comprar',
    finalidade: 'residencial',
    quartos: 0,
    salas: 0,
    banheiros: 0,
    dormitorios: 0,
    garagem: 0,
    tipos: [],
    precos: {
      min: null,
      max: null,
    },
    area: {
      min: null,
      max: null,
    },
    bairros: [],
    cidade: '',
    query: '',
    page: 1,
    queryParams: {}
  };

  @Output() customSearchChange = new EventEmitter<any>();

  public MASKS = MASKS;

  filtred: any[] = [];

  queryParams: any;

  cidades: string[] = [];
  bairrosSelecionados: any[] = [];
  locais: any[];

  removeParams: any[] = [];

  windowWidth = 0;

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

  constructor(private firestore: Firestore, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.loadDefaults();
    this.windowWidth = window.innerWidth;


  }

  ngAfterViewInit() {
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
      this.customSearch.queryParams = this.queryParams;

      this.customSearchChange.emit(this.customSearch);
    });
  }


  applyFilter() {
    this.closeMe();
    this.doSearch(false);
  }

  changeStep(goTo: number, value?: any, check = false) {
    if (goTo > -1 && !value) {
      if (this.customSearch.finalidade === 'lancamento') {
        this.goLancamento();
      } else {
        if(check && this.currentStep <= goTo) {
          return;
        }
        this.currentStep = goTo;
      }
    }
    if (value) {
      switch (goTo) {
        case 1:
          this.customSearch.categoria = value;
          break;
        case 2:
          this.customSearch.finalidade = value;
          break;
      }
    }

    this.finalidadeSelector?.close();
  }

  inputPriceFocusOut(e: FocusEvent) {
      console.log(this.customSearch.precos.min);
      const value = new CURRENCYPipe().transform(currencyToNumber(this.customSearch.precos.min), 0);
      console.log(value);
  }

  doSearch(simple = false) {
    this.router.navigate(['imoveis'], {
      queryParams: simple ? {
        finalidade: this.customSearch.finalidade,
        categoria: this.customSearch.categoria,
        query: this.customSearch.query
      } : this.makeParams()
    }).then(() => {
      this.closeMe();
      this.currentStep = 0;
    }).catch(reason => console.error(reason));
  }

  closeMe() {
    this.showMe = false;
    this.currentStep = 0;
  }


  makeParams() {
    let tipos = [];
    let querys = this.removeParams.map(value => value.query);
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
      precos = this.customSearch.precos.min + ',' + this.customSearch.precos.max;
    }
    return {
      finalidade: !querys.includes('finalidade') ? this.customSearch.finalidade : '',
      tipo: tipos,
      categoria: !querys.includes('categoria') ? this.customSearch.categoria : '',
      precos,
      area,
      custom: true,
      dormitorios: !querys.includes('dormitorios') ? (this.customSearch.dormitorios > 0 ? this.customSearch.dormitorios : '') : '',
      garagem: !querys.includes('garagem') ? (this.customSearch.garagem > 0 ? this.customSearch.garagem : '') : '',
      banheiros: !querys.includes('banheiros') ? (this.customSearch.banheiros > 0 ? this.customSearch.banheiros : '') : '',
      salas: !querys.includes('salas') ? (this.customSearch.salas > 0 ? this.customSearch.salas : '') : '',
      bairros: bairros,
      cidade: !querys.includes('cidade') ? this.customSearch.cidade : '',
      page: this.customSearch.page,
      query: this.customSearch.query
    };
  }

  goLancamento() {
    this.closeMe();
    this.customSearch.finalidade= 'residencial';
    document.getElementById('backdrop').scrollIntoView({behavior: "smooth"});
  }

  result() {
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
    const search = {
      finalidade: this.customSearch.finalidade, tipo: tipos.join(','),
      categoria: this.customSearch.categoria, precos: precos, area: area, custom: true,
      dormitorios: this.customSearch.dormitorios, salas: this.customSearch.salas,
      bairros: bairros.join(','), cidade: this.customSearch.cidade
    };
  }

  numberMask(rawValue: string): RegExp[] {
    const mask = /[A-Za-z]/;
    const strLength = String(rawValue).length;
    const nameMask: RegExp[] = [];

    for (let i = 0; i <= strLength; i++) {
      nameMask.push(mask);
    }

    return nameMask;

  }

  searchAutocomplete(event: any) {
    const datalist = document.querySelector('datalist');
    if (this.customSearch.query.length > 3) {
      datalist.id = 'dynmicUserIds';
    } else {
      datalist.id = '';
    }

  }


  changeCidade(cidade: MatSelectChange) {
    console.log(cidade)
    this.customSearch.cidade = cidade.value;
    this.buildLocaisBairros(cidade.value);
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

    _.sortBy(_.union(_.compact(_.map(this.filtred[cidade], (im: any, key) => {
      return im.bairro;
    }))), bairro => bairro).forEach((value, index) => {
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


    collectionSnapshots(collection(this.firestore, PATH_LOCAIS))
      .pipe(map((actions) => actions.map((a) => {
        return {id: a.id, ...a.data()}
      })))
      .subscribe(value => {
        this.locais = value;
        this.rebuildFilter();
      })


    docSnapshots(doc(this.firestore, `${PATH_AUTOCOMPLETE}/${PATH_AUTOCOMPLETE}`))
      .pipe(map((a) => {
        return a.data();
      }))
      .subscribe(strings => {
        console.log(strings);
        this.autocompletes = strings.autocomplete;
      });

  }


  rebuildFilter(event?: any) {
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
    if (this.customSearch.finalidade === 'residencial') {
      tipos = TIPOS_RESIDENCIAL;
    } else {
      tipos = TIPOS_COMERCIAL;
    }
    tipos.forEach((value, index) => {
      this.customSearch.tipos.push({key: value, selected: false, i: index});
    });

    console.log(this.customSearch.tipos);

    console.log(this.customSearch.tipos.length);
    this.cidades = _.union(this.cidades)
    console.log(this.cidades);
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target) {

      this.windowWidth = event.target.innerWidth;
    }

  }
}
