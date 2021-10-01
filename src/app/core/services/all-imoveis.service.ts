import {Injectable} from '@angular/core';
import {NgxUiLoaderService} from "ngx-ui-loader";
import {Imovel} from "../../imoveis/models/imovel.model";
import {finalize, first, map} from "rxjs/operators";
import {PATH_IMOVEIS} from "../utils/constants.util";
import {collection, Firestore, getDocs, limit, orderBy, query, startAfter, where} from "@angular/fire/firestore";
import {from} from "rxjs";


@Injectable({
  providedIn: 'root',
})
export class AllImoveis {



  constructor(private ngxService: NgxUiLoaderService, private firestore: Firestore) {

  }

  getImoveis(customSearch: any, last?: Imovel) {
    const wheres = [];
    // bairros: [] ok
    // banheiros: 0 ok
    // categoria: "comprar" ok
    // cidade: "" ok
    // dormitorios: "0" ok
    // finalidade: "comercial" ok
    // garagem: 0 ok
    // tipo: [] ok
    // salas: "0" ok
    // page: 1
    // area: {min: 0, max: 61000}
    // precos: {min: 0, max: 4000000}

    console.log(customSearch);

    const compra = 'comercializacao.venda.ativa';
    const venda = 'comercializacao.locacao.ativa';
    const compra_preco = 'comercializacao.venda.preco';
    const venda_preco = 'comercializacao.locacao.preco';

    wheres.push(where('finalidade', '==', customSearch.finalidade));
    wheres.push(where(customSearch.categoria === 'comprar' ? compra : venda, '==', true));
    //
    if (customSearch.bairros?.length > 0) {
      wheres.push(where('local.bairro', 'in', customSearch.bairros));
    }

    if (customSearch.banheiros > 0) {
      wheres.push(where('numeros.banheiros', '==', customSearch.banheiros));
    }

    if (customSearch.cidade) {
      console.log(customSearch.cidade)
      wheres.push(where('local.cidade', '==', customSearch.cidade));
    }

    if (customSearch.dormitorios > 0) {
      wheres.push(where('numeros.dormitorios', '==', customSearch.dormitorios));
    }

    if (customSearch.garagem > 0) {
      wheres.push(where('numeros.garagem', '==', customSearch.garagem));
    }
    if (customSearch.salas > 0) {
      wheres.push(where('numeros.salas', '==', customSearch.salas));
    }

    if (customSearch.tipo?.length > 0) {
      wheres.push(where('tipo', 'in', customSearch.tipo));
    }

    // area: {min: 0, max: 61000}
    // precos: {min: 0, max: 4000000}
    // if (customSearch.area.min !== 0 || customSearch.area.max !== 61000) {
    //   wheres.push(where('numeros.areas.total', '>=', customSearch.area.min));
    //   wheres.push(where('numeros.areas.total', '<=', customSearch.area.max));
    // }

    // if (customSearch.precos.min !== 0 || customSearch.precos.max !== 4000000) {
    //   wheres.push(where(customSearch.categoria === 'comprar' ? compra_preco : venda_preco, '>=', customSearch.precos.min));
    //   wheres.push(where(customSearch.categoria === 'comprar' ? compra_preco : venda_preco, '<=', customSearch.precos.max));
    // }

    wheres.push(limit(10));
    wheres.push(orderBy('sigla'));

    if (last) {
      console.log(last);
      wheres.push(startAfter(last.sigla));
    }
    console.log(wheres);

    return from(getDocs(query(collection(this.firestore, PATH_IMOVEIS), ...wheres)))
      .pipe(
        map(actions => actions.docs.map(a => {
          console.log()
          return a.data();
        })));
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
