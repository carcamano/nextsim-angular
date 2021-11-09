import {Injectable} from '@angular/core';
import {NgxUiLoaderService} from "ngx-ui-loader";
import {Imovel} from "../../imoveis/models/imovel.model";
import {finalize, first, map} from "rxjs/operators";
import {PATH_IMOVEIS} from "../utils/constants.util";
import {collection, Firestore, getDocs, orderBy, query, where} from "@angular/fire/firestore";
import {from} from "rxjs";
import {toAreaInt} from "../utils/imovel.util";


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

  getImoveisByFinalidadeTipo(finalidade: string, categoria: string) {
    return from(getDocs(query(collection(this.firestore, PATH_IMOVEIS),
      where('finalidade', '==', finalidade),
      where(categoria === 'comprar' ? 'comercializacao.venda.ativa' : 'comercializacao.locacao.ativa', '==', true)
      )))
      .pipe(
        map(actions => actions.docs.map(a => {
          return a.data();
        })),
      );
  }

  getImoveisDestaque() {
    return from(getDocs(query(collection(this.firestore, PATH_IMOVEIS),
      where('site.imobiliaria.destaque', '==', true),
    )))
      .pipe(
        map(actions => actions.docs.map(a => {
          return a.data();
        })),
      );
  }

  getImoveis(customSearch: any, last?: Imovel) {
    const wheres = [];

    const compra = 'comercializacao.venda.ativa';
    const venda = 'comercializacao.locacao.ativa';
    const compra_preco = 'comercializacao.venda.preco';
    const venda_preco = 'comercializacao.locacao.preco';

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
    }

    //
    if (customSearch.bairros?.length > 0) {
      if (customSearch.bairros?.length > 10) {
        return;
      }
      if (customSearch.bairros?.length > 1) {
        wheres.push(where('local.bairro', 'in', customSearch.bairros));
        isIn = true;
      } else {
        wheres.push(where('local.bairro', '==', customSearch.bairros[0]));
      }
    }

    if (customSearch.tipos?.length > 0) {
      if (customSearch.tipos?.length > 1 && !isIn) {
        if (customSearch.tipos?.length > 10) {
          return;
        }
        wheres.push(where('tipo', 'in', customSearch.tipos));
      } else if (customSearch.tipos?.length > 1) {
        needSubfilter = true;
      } else {
        wheres.push(where('tipo', '==', customSearch.tipos[0]));
      }
    }


    wheres.push(orderBy('sigla'));


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
          if (parseInt(customSearch.banheiros) > 0 && value.numeros?.banheiros) {
            is = parseInt(customSearch.banheiros) === 4 ? value.numeros.banheiros >= 4 : value.numeros.banheiros === parseInt(customSearch.banheiros);
          }

          if (is && parseInt(customSearch.dormitorios) > 0 && value.numeros?.dormitorios) {
            is = parseInt(customSearch.dormitorios) === 4 ? value.numeros.dormitorios >= 4 : value.numeros.dormitorios === parseInt(customSearch.dormitorios);
          }

          if (is && parseInt(customSearch.garagem) > 0 && value.numeros?.vagas) {
            is = parseInt(customSearch.garagem) === 4 ? value.numeros.vagas >= 4 : value.numeros.vagas === parseInt(customSearch.garagem);
          }
          if (is && parseInt(customSearch.salas) > 0 && value.numeros?.salas) {
            is = parseInt(customSearch.salas) === 4 ? value.numeros.salas >= 4 : value.numeros.salas === parseInt(customSearch.salas);
          }

          if (is && parseInt(customSearch.area?.min) > 0 && toAreaInt(value)) {
            is = parseInt(customSearch.area?.min) <= toAreaInt(value);
          }
          if (is && parseInt(customSearch.area?.max) > 0 && toAreaInt(value)) {
            is = parseInt(customSearch.area?.max) >= toAreaInt(value);
          }


          if (is && parseInt(customSearch.precos?.min) && (customSearch.categoria === 'comprar' ? value.comercializacao?.venda?.preco : value.comercializacao?.locacao?.preco)) {
            is = parseInt(customSearch.precos?.min) <= (customSearch.categoria === 'comprar' ? value.comercializacao?.venda?.preco : value.comercializacao?.locacao?.preco);
          }
          if (is && parseInt(customSearch.precos?.max) && (customSearch.categoria === 'comprar' ? value.comercializacao?.venda?.preco : value.comercializacao?.locacao?.preco)) {
            is = parseInt(customSearch.precos?.max) >= (customSearch.categoria === 'comprar' ? value.comercializacao?.venda?.preco : value.comercializacao?.locacao?.preco);
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
          return a.data();
        })),
        first(),
        finalize(() => this.ngxService.stop('getBySigla')));
  }


}
