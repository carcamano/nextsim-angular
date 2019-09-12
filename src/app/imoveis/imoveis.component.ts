import {Component, OnInit} from '@angular/core';
import {ImoveisService} from './imoveis.service';
import {Imovel} from './models/imovel.model';
import {ActivatedRoute} from '@angular/router';
import {HttpResponse} from '@angular/common/http';

@Component({
  selector: 'app-imoveis',
  templateUrl: './imoveis.component.html',
  styleUrls: ['./imoveis.component.css']
})
export class ImoveisComponent implements OnInit {

  pages = 0;
  currentPage = 1;

  customSearch = false;

  private itensPerPage = 10;


  imoveis: Imovel[];
  allImoveis: Imovel[];

  queryParams: any;

  mySlideOptions = {items: 1, dots: true, nav: false};
  myCarouselOptions = {items: 3, dots: true, nav: true};

  constructor(private imoveisService: ImoveisService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;
      this.getImoveis();
    });
  }

  changePage(page: number) {
    console.log(page);
    this.currentPage = page;
    if (!this.customSearch) {
      this.getImoveis();
    } else {
      this.filterAll();
    }
  }

  private filterAll() {
    console.log(this.imoveis.length);
    console.log(this.allImoveis.length);

    this.imoveis = [];
    const filtred = this.allImoveis.filter(imovel => {
      const f = [];
      if (this.queryParams.tipo) {
        const tipos = this.queryParams.tipo.split(',');
        if (tipos.includes(imovel.tipo)) {
          f.push('t');
        } else {
          f.push('f');
        }
      }
      if (this.queryParams.finalidade) {
        if (this.queryParams.finalidade === imovel.finalidade) {
          f.push('t');
        } else {
          f.push('f');
        }
      }
      if (this.queryParams.categoria) {
        if (this.queryParams.categoria === 'comprar' && imovel.comercializacao.venda && imovel.comercializacao.venda.ativa) {
          f.push('t');
        } else if (this.queryParams.categoria === 'alugar' && imovel.comercializacao.locacao && imovel.comercializacao.locacao.ativa) {
          f.push('t');
        } else {
          f.push('f');
        }
      }
      if (this.queryParams.precos) {
        const values = this.queryParams.precos.split(',');
        console.log(values)
        console.log(values.length)
        if (values.length === 2) {
          if (imovel.comercializacao.venda && imovel.comercializacao.venda.preco >= values[0] &&
            imovel.comercializacao.venda.preco <= values[1]) {
            f.push('t');
          } else if (imovel.comercializacao.locacao && imovel.comercializacao.locacao.preco >= values[0] &&
            imovel.comercializacao.locacao.preco <= values[1]) {
            f.push('t');
          } else {
            f.push('f');
          }
        } else {
          f.push('f');
        }
      }

      // areas
      if (this.queryParams.area) {
        const values = this.queryParams.area.split(',');
        if (values.length === 2) {
          if (imovel.numeros && imovel.numeros.areas && imovel.numeros.areas.util >= values[0] && imovel.numeros.areas.util <= values[1]) {
            f.push('t');
          } else {
            f.push('f');
          }
        } else {
          f.push('f');
        }
      }
      console.log(f);
      console.log(!f.includes('f'));
      return !f.includes('f');
    });

    this.imoveis = this.chunkArray(filtred, this.itensPerPage)[this.currentPage];
    console.log(this.imoveis.length);

    this.scrollTop();
  }

  private getImoveis() {
    this.imoveis = [];
    this.pages = 0;
    // this.currentPage = 1;
    if (this.queryParams.custom) {
      this.imoveisService.all().subscribe((res: Imovel[]) => {
        this.allImoveis = res;
        this.filterAll();
      });
    } else {
      this.imoveisService.imoveis(this.queryParams, this.currentPage).subscribe((res: HttpResponse<Imovel[]>) => {
        this.pages = Number(res.headers.get('X-Total-Count'));
        this.imoveis = res.body;
        console.log(res.body);
        console.log(this.imoveis.length);
        this.scrollTop();
      });
    }
  }


  private scrollTop() {
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  private chunkArray(myArray: Imovel[], chunkSize: number) {
    const arrayLength = myArray.length;
    const tempArray = [];

    for (let index = 0; index < arrayLength; index += chunkSize) {
      const myChunk = myArray.slice(index, index + chunkSize);
      tempArray.push(myChunk);
    }
    return tempArray;
  }

}
