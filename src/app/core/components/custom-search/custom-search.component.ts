import {Component, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {Options} from "ng5-slider";
import {formatCurrency} from "@angular/common";
import * as _ from "lodash";
import {collection, collectionData, collectionSnapshots, doc, docSnapshots, Firestore} from "@angular/fire/firestore";
import {PATH_AREA, PATH_AUTOCOMPLETE, PATH_LOCAIS, PATH_PRECOS} from "../../utils/constants.util";
import {map} from "rxjs/operators";
import {TIPOS_COMERCIAL, TIPOS_RESIDENCIAL} from "../../constants/tipos";
import {NgbDropdown} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";

@Component({
  selector: 'app-custom-search',
  templateUrl: './custom-search.component.html',
  styleUrls: ['./custom-search.component.scss']
})
export class CustomSearchComponent implements OnInit {

  currentStep = 0;

  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];


  @ViewChild('myDrop') finalidadeSelector: NgbDropdown;

  autocompletes: string[] = [];

  @Input() showMe = false;

  customSearch = {
    categoria: 'comprar',
    finalidade: 'residencial',
    quartos: 0,
    salas: 0,
    banheiros: 0,
    dormitorios: 0,
    garagem: 0,
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
    query: '',
    page: 1
  };

  filtred: any[] = [];

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

  constructor(private firestore: Firestore, private router: Router) {
  }

  ngOnInit(): void {
    this.loadDefaults();
    this.windowWidth = window.innerWidth;
  }

  changeStep(goTo: number, value?: any) {
    if (goTo > -1 && !value) {
      this.currentStep = goTo;
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

  doSearch() {
    this.router.navigate(['imoveis'], {
      queryParams: this.makeParams()
    }).then(value => {
      this.showMe = false;
      this.currentStep = 0;
      console.log(value);
    }).catch(reason => console.error(reason));
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

  searchAutocomplete(event: any) {
    const datalist = document.querySelector('datalist');
    if (this.customSearch.query.length > 3) {
      datalist.id = 'dynmicUserIds';
    } else {
      datalist.id = '';
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


    collectionSnapshots(collection(this.firestore, PATH_LOCAIS))
      .pipe(map((actions) => actions.map((a) => {
        return {id: a.id, ...a.data()}
      })))
      .subscribe(value => {
        this.locais = value;
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
    if (this.customSearch.finalidade === 'residencial') {
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


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target) {

      this.windowWidth = event.target.innerWidth;
    }

  }
}
