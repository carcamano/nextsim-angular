import {Injectable} from '@angular/core';
import {NgxUiLoaderService} from "ngx-ui-loader";
import {Imovel} from "../../imoveis/models/imovel.model";
import {finalize, first, map, filter} from "rxjs/operators";
import {PATH_IMOVEIS} from "../utils/constants.util";
import {collection, Firestore, getDocs, limit, orderBy, query, startAfter, where} from "@angular/fire/firestore";
import {from} from "rxjs";


@Injectable({
  providedIn: 'root',
})
export class AllImoveis {


  constructor(private ngxService: NgxUiLoaderService, private firestore: Firestore) {

  }

  getImoveisByBairro(bairro: string) {
    return from(getDocs(query(collection(this.firestore, PATH_IMOVEIS), where('local.bairro', '==', bairro))))
      .pipe(
        map(actions => actions.docs.map(a => {
          return a.data();
        })),
      );
  }

  getImoveisByCidade(cidade: string) {
    return from(getDocs(query(collection(this.firestore, PATH_IMOVEIS), where('local.cidade', '==', cidade))))
      .pipe(
        map(actions => actions.docs.map(a => {
          return a.data();
        })),
      );
  }

  getImoveis(customSearch: any, last?: Imovel) {
    const wheres = [];

    console.log(customSearch);

    const compra = 'comercializacao.venda.ativa';
    const venda = 'comercializacao.locacao.ativa';
    const compra_preco = 'comercializacao.venda.preco';
    const venda_preco = 'comercializacao.locacao.preco';

    let customFilter = false;
    let isIn = false;
    let needSubfilter = false;
    if (customSearch.finalidade) {
      wheres.push(where('finalidade', '==', customSearch.finalidade));
    }

    if (customSearch.categoria) {
      wheres.push(where(customSearch.categoria === 'comprar' ? compra : venda, '==', true));
    }

    if (customSearch.cidade) {
      wheres.push(where('local.cidade', '==', customSearch.cidade));
      customFilter = true;
    }

    //
    if (customSearch.bairros?.length > 0) {
      if(customSearch.bairros?.length > 10) {
        return ;
      }
      if (customSearch.bairros?.length > 1) {
        wheres.push(where('local.bairro', 'in', customSearch.bairros));
        isIn = true;
      } else {
        wheres.push(where('local.bairro', '==', customSearch.bairros[0]));
      }
      customFilter = true;
    }

    if (customSearch.tipos?.length > 0) {
      if (customSearch.tipos?.length > 1 && !isIn) {
        if(customSearch.tipos?.length > 10) {
          return ;
        }
        wheres.push(where('tipo', 'in', customSearch.tipos));
      } else if (customSearch.tipos?.length > 1) {
        needSubfilter = true;
      } else {
        wheres.push(where('tipo', '==', customSearch.tipos[0]));
      }
      customFilter = true;
    }


    if (!customFilter) {
      // wheres.push(limit(10));
    }
    wheres.push(orderBy('sigla'));

    if (last) {
      console.log(last);
      // wheres.push(startAfter(last.sigla));
    }

    return from(getDocs(query(collection(this.firestore, PATH_IMOVEIS), ...wheres)))
      .pipe(
        map(actions => actions.docs.map(a => {
          return a.data();
        })),
        map(value => value.filter(value => {
          return needSubfilter ? customSearch.tipos.includes(value.tipo) : true;
        })),
        map(value => value.filter((value: Imovel) => {
          let is = true;
          if (customSearch.banheiros > 0 && value.numeros?.banheiros) {
            is = customSearch.banheiros === 4 ? value.numeros.banheiros >= 4 : value.numeros.banheiros === customSearch.banheiros;
          }

          if (is && customSearch.dormitorios > 0 && value.numeros?.dormitorios) {
            is = customSearch.dormitorios === 4 ? value.numeros.dormitorios >= 4 : value.numeros.dormitorios === customSearch.dormitorios;
          }

          if (is && customSearch.garagem > 0 && value.numeros?.vagas) {
            is = customSearch.garagem === 4 ? value.numeros.vagas >= 4 : value.numeros.vagas === customSearch.garagem;
          }
          if (is && customSearch.salas > 0 && value.numeros?.salas) {
            is = customSearch.salas === 4 ? value.numeros.salas >= 4 : value.numeros.salas === customSearch.salas;
          }

          if (is && customSearch.area?.min > 0 && value.numeros?.areas?.total) {
            is = customSearch.area?.min >= value.numeros.areas.total;
          }
          if (is && customSearch.area?.max > 0 && value.numeros?.areas?.total) {
            is = customSearch.area?.max <= value.numeros.areas.total;
          }

          if (is && customSearch.precos?.min) {
            is = customSearch.precos?.min >= (customSearch.categoria === 'comprar' ? customSearch.comercializacao.venda.preco : customSearch.comercializacao.locacao.preco);
          }
          if (is && customSearch.precos?.max) {
            is = customSearch.precos?.max <= (customSearch.categoria === 'comprar' ? customSearch.comercializacao.venda.preco : customSearch.comercializacao.locacao.preco);
          }

          return is;
        }))
      );
  }


  getBySigla(sigla: string) {
    this.ngxService.start('getBySigla');
    return from(getDocs(query(collection(this.firestore, PATH_IMOVEIS), where('sigla', '==', sigla))))
      .pipe(
        map(actions => actions.docs.map(a => {
          console.log()
          return a.data();
        })),
        first(),
        finalize(() => this.ngxService.stop('getBySigla')));
  }


}
