import {Injectable} from '@angular/core';
import {NgxUiLoaderService} from "ngx-ui-loader";
import * as jsonpack from "jsonpack";
import * as moment from 'moment';
import {Imovel} from "../../imoveis/models/imovel.model";
import {map} from "rxjs/operators";
import {PATH_IMOVEIS} from "../utils/constants.util";
import {collection, collectionData, Firestore} from "@angular/fire/firestore";


@Injectable({
  providedIn: 'root',
})
export class AllImoveis {


  private imoveis: any[];

  constructor(private ngxService: NgxUiLoaderService, private firestore: Firestore) {

  }

  getAll(callback?: (imoveis?: Imovel[]) => void, force: boolean = false) {
    try {
      let lastUpdate = localStorage.getItem('nextsim_lastUpdate');
      const localImoveis = localStorage.getItem('nextsim_imoveis');

      if (lastUpdate) {
        const date = moment(lastUpdate);
        if (!date.isSame(moment(), 'day')) {
          lastUpdate = null
        }
      }
      if (force) {
        this.mainGetAll(callback);
      } else if (lastUpdate && localImoveis) {
        this.imoveis = jsonpack.unpack(localImoveis);
        if (callback) callback(this.imoveis);
      } else {
        this.mainGetAll(callback);
      }
    } catch (e) {
      console.error(e);
      this.mainGetAll(callback);
    }
  }

  getImoveis(customSearch: any) {

  }

  private mainGetAll(callback?: (imoveis?: Imovel[]) => void): void {
    this.getAllFromFirestoreCallback(callback);
    // this.getFromDb(callback);
  }

  private getAllFromFirestoreCallback(callback?: (imoveis?: Imovel[]) => void): void {
    this.ngxService.start('getFromDb');
    collectionData(collection(this.firestore, PATH_IMOVEIS))
      .pipe(map((actions) => actions.map((a) => {
        return a.data() as Imovel;
      })))
      .subscribe(value => {
        console.log(value);
        this.imoveis = value;
        try {
          localStorage.setItem('nextsim_lastUpdate', moment().format("MM-DD-YYYY"));
          localStorage.setItem('nextsim_imoveis', jsonpack.pack(value));
        } catch (e) {
          console.log(e);
          localStorage.clear();
          try {
            localStorage.setItem('nextsim_lastUpdate', moment().format("MM-DD-YYYY"));
            localStorage.setItem('nextsim_imoveis', jsonpack.pack(value));
          } catch (ee) {
            console.log(ee);
          }
        }
        this.ngxService.stop('getFromDb');
        if (callback) callback(this.imoveis);
      });
  }

  getBySigla(sigla: string, callback?: (imovel?: any) => void) {
    if (this.imoveis && this.imoveis.length > 0) {
      if (callback) callback(this.imoveis.find((value: Imovel) => value.sigla === sigla));
    } else {

      this.ngxService.start('getBySigla');
      // this.db.list('/imoveis', ref => ref.orderByChild('sigla').equalTo(sigla)).valueChanges().subscribe(value => {
      //   this.ngxService.stop('getBySigla')
      //   if (callback) callback(value ? value[0] : null);
      // });
    }
  }


}
