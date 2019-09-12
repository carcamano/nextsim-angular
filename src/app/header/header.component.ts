import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup} from '@angular/forms';
import {GeneralService} from '../imoveis/general.service';
import {HttpResponse} from '@angular/common/http';
import {Imovel} from '../imoveis/models/imovel.model';
import { Options } from 'ng5-slider';

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

  customSearch =  {
    categoria: 'comprar',
    finalidade: 'residencial',
    quartos: 0,
    salas: 0,
    tipos: [],
    precos: {
      min: 0,
      max: 39000000,
    },
    area: {
      min: 0,
      max: 61000,
    }
  }

  options: Options = {
    floor: 0,
    ceil: this.customSearch.precos.max,
    translate: (value: number): string => {
      return 'R$' + value;
    }
  };

  optionsArea: Options = {
    floor: 0,
    ceil: this.customSearch.area.max,
    translate: (value: number): string => {
      return value + ' M²';
    }
  };


  constructor(private router: Router, private modalService: NgbModal, private generalService: GeneralService) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url.includes('/imoveis')) {
        this.rootView = false;
        this.simpleSearch = {
          finalidade: null,
          categoria: null,
          campo: null
        };
      } else if (event instanceof NavigationEnd && !event.url.includes('/imoveis')) {
        this.rootView = true;
      }
      this.loadDefaults();
    });
  }

  ngOnInit() {
    // console.log(this.router);
    // this.rootView = this.router.url;
    this.loadDefaults();
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
      this.customSearch.tipos = this.customSearch.tipos.filter(value => {
        return value.selected === true;
      }).map(value => {
        return value.key;
      });
      this.customSearch.tipos.push(this.customSearch.finalidade);
      const area: string = this.customSearch.area.min + ',' + this.customSearch.area.max;
      const precos: string = this.customSearch.precos.min + ',' + this.customSearch.precos.max;
      this.search({finalidade: this.customSearch.finalidade, tipo: this.customSearch.tipos.join(','), categoria: this.customSearch.categoria, precos: precos, area: area, custom: true});
    }, (reason) => {

    });
  }

  search(query) {
    console.log('query');
    console.log(query);
    if (this.simpleSearch.finalidade || this.simpleSearch.categoria || this.simpleSearch.campo || query) {
      this.router.navigate(['imoveis'], {
        queryParams: query || {finalidade: this.simpleSearch.finalidade, categoria: this.simpleSearch.categoria, query: this.simpleSearch.campo}
      });
    }
  }


  changeTipo(event: any, i: number) {
    this.customSearch.tipos[i].selected = event.currentTarget.checked;
    console.log(this.customSearch.tipos);
  }



  private loadDefaults() {
    this.generalService.tipos().subscribe((res: HttpResponse<string[]>) => {
      this.customSearch.tipos = res.body.map((value, index, array) => {
        return {key: value, selected: false, i: index};
      });
    });

    this.generalService.area().subscribe((res: HttpResponse<any>) => {
      this.customSearch.area.max = res.body.max;
      this.customSearch.area.min = res.body.min;
    });

    this.generalService.precos().subscribe((res: HttpResponse<any>) => {
      this.customSearch.precos.max = res.body.max;
      this.customSearch.precos.min = res.body.min;
    });
  }

}
