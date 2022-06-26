import {AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import * as _ from 'lodash';
import {collection, collectionData, collectionSnapshots, doc, docSnapshots, Firestore} from '@angular/fire/firestore';
import {PATH_AREA, PATH_AUTOCOMPLETE, PATH_LOCAIS, PATH_PRECOS} from '../../utils/constants.util';
import {map} from 'rxjs/operators';
import {TIPOS_COMERCIAL, TIPOS_RESIDENCIAL} from '../../constants/tipos';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import {CustomSearchType} from './custom-search.enum';
import {MatSelectChange} from '@angular/material/select';
import {MASKS, NgBrDirectives} from 'ng-brazil';
import {currencyToNumber} from '../../utils/imovel.util';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-custom-search',
  templateUrl: './custom-search.component.html',
  styleUrls: ['./custom-search.component.scss']
})
export class CustomSearchComponent implements OnInit, AfterViewInit {

  currentStep = 0;

  CustomSearchType = CustomSearchType;
  TIPOS_RESIDENCIAL = TIPOS_RESIDENCIAL;
  TIPOS_COMERCIAL = TIPOS_COMERCIAL;
  @Input() type: CustomSearchType = CustomSearchType.simple;


  @ViewChild('myDrop') finalidadeSelector: NgbDropdown;

  autocompletes: string[] = [];

  @Input() set showMe(v: boolean) {
    this.showMeValue = v;
    this.check();
  }

  get showMe() {
    return this.showMeValue;
  }

  showMeValue = false;

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
    autocomplete: '',
    page: 1,
    destaques: false
  };

  @Input() set forceSearch(s: boolean) {
    this.forceSearchValue = s;
    this.doSearch(false);
  }

  get forceSearch() {
    return this.forceSearchValue;
  }

  private forceSearchValue = false;

  @Output() customSearchChange = new EventEmitter<any>();
  @Output() simpleSearchChange = new EventEmitter<any>();

  public MASKS = MASKS;

  filtred: any[] = [];

  queryParams: any;

  cidades: string[] = [];
  bairrosSelecionados: any[] = [];
  tiposSelecionados: any[] = [];
  locais: any[];

  removeParams: any[] = [];

  windowWidth = 0;

  constructor(private firestore: Firestore, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.loadDefaults();
    this.windowWidth = window.innerWidth;
  }

  ngAfterViewInit() {
    this.route.data.subscribe(data => {
      if (!_.isEmpty(data)) {
        this.queryParams = data;
        if (!this.route.snapshot.data.backing) {
          this.makeCustomSearch(data, true);
        }
      }

    });
    this.route.queryParams.subscribe(queryParams => {
      if (!_.isEmpty(queryParams)) {
        this.queryParams = queryParams;
        if (!this.route.snapshot.data.backing) {
          this.makeCustomSearch(queryParams);
        }
      }
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
        if (check && this.currentStep <= goTo) {
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

  inputPriceFocusOut(e: FocusEvent, id: number) {
    const num = currencyToNumber((e.target as HTMLInputElement).value);

    switch (id) {
      case 0:
        this.customSearch.precos.min = num;
        break;
      case 1:
        this.customSearch.precos.max = num;
        break;
      case 2:
        this.customSearch.area.min = num;
        break;
      case 3:
        this.customSearch.area.max = num;
        break;
    }
  }

  doSearch(simple = false) {
    this.router.navigate(['imoveis'], {
      queryParams: simple ? {
        finalidade: this.customSearch.finalidade,
        categoria: this.customSearch.categoria,
        query: this.customSearch.query
      } : this.makeParams()
    }).then(() => {
      this.customSearchChange.emit(simple ? {
        finalidade: this.customSearch.finalidade,
        categoria: this.customSearch.categoria,
        query: this.customSearch.query
      } : this.makeParams());
      this.closeMe();
      this.currentStep = 0;
    }).catch(reason => console.error(reason));
  }

  closeMe() {
    this.showMe = false;
    this.currentStep = 0;
  }

  makeParams() {
    const querys = this.removeParams.map(value => value.query);
    let area: string;
    if (!querys.includes('area')) {
      if (this.customSearch.area.min) {
        this.customSearch.area.min = parseInt(this.customSearch.area.min.toString()
          .replace('R$ ', '').replace('.', '')
          .replace(',', '.'), 0);
      }
      if (this.customSearch.area.max) {
        this.customSearch.area.max = parseInt(this.customSearch.area.max.toString()
          .replace('R$ ', '').replace('.', '')
          .replace(',', '.'), 0);
      }
      area = this.customSearch.area.min + ',' + this.customSearch.area.max;
    }
    let precos: string;
    if (!querys.includes('precos')) {

      if (this.customSearch.precos.min) {
        this.customSearch.precos.min = parseInt(this.customSearch.precos.min.toString()
          .replace('R$ ', '').replace('.', '')
          .replace(',', '.')) || null;
      }
      if (this.customSearch.precos.max) {
        this.customSearch.precos.max = parseInt(this.customSearch.precos.max.toString()
          .replace('R$ ', '').replace('.', '')
          .replace(',', '.')) || null;
      }
      precos = this.customSearch.precos.min + ',' + this.customSearch.precos.max;
    }
    return {
      finalidade: !querys.includes('finalidade') ? this.customSearch.finalidade : '',
      categoria: !querys.includes('categoria') ? this.customSearch.categoria : '',
      tipos: this.tiposSelecionados || [],
      precos: this.customSearch.precos || '',
      area: this.customSearch.area || '',
      custom: true,
      dormitorios: (this.customSearch.dormitorios > 0 ? this.customSearch.dormitorios : '') || '',
      garagem: this.customSearch.garagem || '',
      banheiros: (this.customSearch.banheiros > 0 ? this.customSearch.banheiros : '') || '',
      salas: this.customSearch.salas > 0 ? this.customSearch.salas : '' || '',
      bairros: this.bairrosSelecionados || [],
      cidade: this.customSearch.cidade || '',
      page: this.customSearch.page,
      query: this.customSearch.query
    };
  }

  goLancamento() {
    this.closeMe();
    this.customSearch.finalidade = 'residencial';
    document.getElementById('backdrop').scrollIntoView({behavior: 'smooth'});
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
    this.customSearch.cidade = cidade.value;
    this.bairrosSelecionados = [];
    this.buildLocaisBairros(cidade.value);
  }

  changeTipo(event: MatSelectChange) {
    if (this.tiposSelecionados.length > 10) {
      this.toastr.error('Você pode selecionar apenas até 10 tipos de imóvel!', 'Maximo 10 selecionados!');
    }
  }

  changeBairro(event: MatSelectChange) {
    if (this.bairrosSelecionados.length > 10) {
      this.toastr.error('Você pode selecionar apenas até 10 bairros!', 'Maximo 10 selecionados!');
    }
  }

  buildLocaisBairros(cidade: string) {
    this.customSearch.bairros = [];

    _.sortBy(_.union(_.compact(_.map(this.filtred[cidade], (im: any, key) => {
      return im.bairro;
    }))), bairro => bairro).forEach((value, index) => {
      this.customSearch.bairros.push(value);
    });

  }

  private makeCustomSearch(queryParams, force = false) {
    this.customSearch.categoria = this.queryParams.categoria || 'comprar';
    if (this.queryParams.finalidade) {
      this.customSearch.finalidade = this.queryParams.finalidade;
    }

    this.customSearch.destaques = false;
    if (this.queryParams.destaques) {
      this.customSearch.destaques = true;
    }
    if ((queryParams.bairros || force) && !this.customSearch.destaques) {
      this.customSearch.salas = this.queryParams.salas || 0,
        this.customSearch.garagem = this.queryParams.garagem || 0 ,
        this.customSearch.dormitorios = this.queryParams.dormitorios || 0,
        this.customSearch.banheiros = this.queryParams.banheiros || 0,
        this.customSearch.cidade = this.queryParams.cidade || '',
        this.customSearch.page = this.queryParams.page || 1;
      this.customSearch.tipos = _.isArray(queryParams?.tipos) ?
        this.queryParams?.tipos : (this.queryParams?.tipos ? [this.queryParams?.tipos] : []);
      this.customSearchChange.emit(this.customSearch);
    } else {
      this.simpleSearchChange.emit(queryParams);
    }
  }

  private check() {
    if (this.showMe && this.customSearch.cidade) {
      this.buildLocaisBairros(this.customSearch.cidade);

    }
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
        return {id: a.id, ...a.data()};
      })))
      .subscribe(value => {
        this.locais = value;
        this.rebuildFilter();
      });


    docSnapshots(doc(this.firestore, `${PATH_AUTOCOMPLETE}/${PATH_AUTOCOMPLETE}`))
      .pipe(map((a) => {
        return a.data();
      }))
      .subscribe(strings => {
        this.autocompletes = strings.autocomplete;
      });

  }


  rebuildFilter(event?: any) {

    if (!this.locais) {
      return;
    }
    this.filtred = this.locais.find(value => {
      return value.id === `${this.customSearch.categoria}_${this.customSearch.finalidade}`;
    });


    this.customSearch.tipos = [];
    this.cidades = [];


    Object.keys(this.filtred).forEach((key: string, i: number) => {
      if (key !== 'id') {
        this.cidades.push(key);
      }
    });

    if (this.cidades?.length > 0) {
      this.customSearch.cidade = this.filtred[this.cidades[0]].cidade;
      this.buildLocaisBairros(this.filtred[this.cidades[0]].cidade);
    }


    if (this.customSearch.finalidade === 'residencial') {
      this.customSearch.tipos = TIPOS_RESIDENCIAL;
    } else {
      this.customSearch.tipos = TIPOS_COMERCIAL;
    }

    this.cidades = _.sortBy(_.union(this.cidades));
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target) {
      this.windowWidth = event.target.innerWidth;
    }

  }
}
