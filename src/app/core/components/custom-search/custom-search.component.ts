import {Component, HostListener, OnInit} from '@angular/core';
import {Options} from "ng5-slider";
import {formatCurrency} from "@angular/common";
import * as _ from "lodash";
import {collection, collectionData, collectionSnapshots, doc, docSnapshots, Firestore} from "@angular/fire/firestore";
import {PATH_AREA, PATH_AUTOCOMPLETE, PATH_LOCAIS, PATH_PRECOS} from "../../utils/constants.util";
import {map} from "rxjs/operators";
import {TIPOS_COMERCIAL, TIPOS_RESIDENCIAL} from "../../constants/tipos";

@Component({
  selector: 'app-custom-search',
  templateUrl: './custom-search.component.html',
  styleUrls: ['./custom-search.component.scss']
})
export class CustomSearchComponent implements OnInit {

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
  locais: any[];

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

  constructor(private firestore: Firestore) {
  }

  ngOnInit(): void {
    this.loadDefaults();
    this.windowWidth = window.innerWidth;
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
