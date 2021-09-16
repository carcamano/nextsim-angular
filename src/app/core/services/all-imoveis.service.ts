import {Injectable} from '@angular/core';
import {NgxUiLoaderService} from "ngx-ui-loader";
import * as jsonpack from "jsonpack";
import * as moment from 'moment';
import {Imovel} from "../../imoveis/models/imovel.model";
import {finalize, first, map, tap} from "rxjs/operators";
import {PATH_AREA, PATH_AUTOCOMPLETE, PATH_IMOVEIS, PATH_PRECOS} from "../utils/constants.util";
import {
  collection,
  collectionData,
  collectionGroup,
  doc,
  docSnapshots,
  Firestore, getDoc, getDocs, limit,
  query, where
} from "@angular/fire/firestore";
import {AngularFirestore, CollectionReference, DocumentData} from "@angular/fire/compat/firestore";
import {from} from "rxjs";


@Injectable({
  providedIn: 'root',
})
export class AllImoveis {


  private imoveis: any[];

  constructor(private ngxService: NgxUiLoaderService, private firestore: Firestore, private afs: AngularFirestore) {

  }

  getImoveis(customSearch: any) {
    const wheres = [];
    // area: {min: 0, max: 61000}
    // bairros: [] ok
    // banheiros: 0 ok
    // categoria: "comprar" ok
    // cidade: "" ok
    // dormitorios: "0" ok
    // finalidade: "comercial" ok
    // garagem: 0 ok
    // page: 1
    // precos: {min: 0, max: 4000000}
    // salas: "0" ok

    const compra = 'comercializacao.venda.ativa';
    const venda = 'comercializacao.locacao.ativa';

    wheres.push(where('finalidade', '==', customSearch.finalidade));
    wheres.push(where(customSearch.categoria === 'comprar' ? compra : venda, '==', true));
    //
    if (customSearch.bairros?.length > 0) {
      wheres.push(where('local.bairro', 'array-contains-any', customSearch.bairros));
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

    wheres.push(limit(10))

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
