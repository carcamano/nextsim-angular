import {Component, ElementRef, OnInit, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {NgbDropdown, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AllImoveis} from '../core/services/all-imoveis.service';
import {WPService} from '../core/services/w-p.service';
import {PATH_AUTOCOMPLETE} from '../core/utils/constants.util';
import {doc, docSnapshots, Firestore} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';
import {CustomSearchComponent} from '../core/components/custom-search/custom-search.component';
import * as _ from 'lodash';
import {MASKS} from 'ng-brazil';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router, private modalService: NgbModal, private allImoveis: AllImoveis, private firestore: Firestore,
              private lancamentoService: WPService, private elementRef: ElementRef, private renderer: Renderer2) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url.includes('/imoveis')) {
        this.rootView = false;
        this.simpleSearch = {
          finalidade: null,
          categoria: null,
          campo: null,
          autocomplete: null
        };
      } else if (event instanceof NavigationEnd && ((event.url.includes('/sobre-nos') ||
        event.url.includes('/quero-negociar') || event.url.includes('/blog') || event.url.includes('/servicos') || event.url.includes('/politica-de-cookies')))) {
        this.rootView = false;
      } else if (event instanceof NavigationEnd && !event.url.includes('/imoveis')) {
        this.rootView = true;
      }
      this.showMobileMenu = false;

    });
  }

  rootView = true;

  simpleSearch = {
    finalidade: null,
    categoria: null,
    campo: null,
    autocomplete: null
  };


  @ViewChild('customSearch') customSearch: CustomSearchComponent;

  autocompletes: any[] = [];

  autocompleteSelected: any;


  showMobileMenu = false;
  modalMobileStep2 = false;

  mobileMenuAlugar = false;

  title = 'Sua melhor forma de acessar imóveis<br> de alto padrão com suporte.';
  image = 'https://admin.nextsim.com.br/wp-content/themes/theme/img/house-bg.jpg';


  protected readonly MASKS = MASKS;

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
    });
  }

  onSelectAutoComplete(e: any, value: string) {
    this.autocompleteSelected = this.autocompletes.find(item => item.value === value);
  }


  open() {
    this.customSearch.showMe = true;
  }

  scroll() {
    document.getElementById('backdrop').scrollIntoView({behavior: 'smooth'});
  }


  searchAutocomplete(event: any) {
    const datalist = document.querySelector('datalist');
    if (this.simpleSearch.campo.length > 3) {
      datalist.id = 'dynmicUserIds';
    } else {
      this.autocompleteSelected = null;
      datalist.id = '';
    }

  }


  search(query?: any) {
    if (!this.autocompleteSelected?.type) {
      const f = this.autocompletes.find(v => v.value?.toUpperCase() === this.simpleSearch?.campo?.toUpperCase());
      if (f) {
        this.autocompleteSelected = f;
      }
    }
    if (this.autocompleteSelected?.type === 'sigla') {
      this.router.navigate(['imoveis', this.autocompleteSelected?.value]).then();
    } else if (this.simpleSearch.finalidade || this.simpleSearch.categoria || this.simpleSearch.campo || query) {
      this.router.navigate(['imoveis'], {
        queryParams: query || {
          finalidade: this.simpleSearch.finalidade,
          categoria: this.simpleSearch.categoria,
          query: this.simpleSearch.campo,
          autocomplete: this.autocompleteSelected?.type
        }
      });
    }
  }

  selectCategoria(value, comp: NgbDropdown) {
    comp.close();
    this.simpleSearch.categoria = value;

  }

  selectFinalidade(value, comp) {
    comp.close();
    this.simpleSearch.finalidade = value;

  }

  openModal(e, content) {
    e.preventDefault();
    e.stopPropagation();
    this.showMobileMenu = false;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      // @ts-ignore
      modalDialogClass: 'client-modal',
      size: 'md',
      centered: true
    }).result.then((result) => {
    }, (reason) => {
    });
  }

  closeModal = () => {
    this.modalService.dismissAll();
  }

  private loadDefaults() {

    docSnapshots(doc(this.firestore, `${PATH_AUTOCOMPLETE}/${PATH_AUTOCOMPLETE}`))
      .pipe(map((a) => {
        return a.data();
      }))
      .subscribe(strings => {
        this.autocompletes = this.autocompletes = _.unionBy(strings.autocomplete, 'value');
      });
  }
}
