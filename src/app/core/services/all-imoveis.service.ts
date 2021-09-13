import {Injectable} from '@angular/core';
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {NgxUiLoaderService} from "ngx-ui-loader";
import * as jsonpack from "jsonpack";
import * as moment from 'moment';
import {MomentModule} from "ngx-moment";
import {COLLECTION_IMOVEIS, Imovel} from "../../imoveis/models/imovel.model";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {map} from "rxjs/operators";


@Injectable({
  providedIn: 'root',
})
export class AllImoveis {


  private imoveis: any[];

  constructor(private db: AngularFireDatabase, private ngxService: NgxUiLoaderService, private firestore: AngularFirestore) {

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

  private mainGetAll(callback?: (imoveis?: Imovel[]) => void): void {
    this.getAllFromFirestoreCallback(callback);
    // this.getFromDb(callback);
  }

  private getAllFromFirestoreCallback(callback?: (imoveis?: Imovel[]) => void): void {
    this.ngxService.start('getFromDb');
    this.firestore.collection(COLLECTION_IMOVEIS).get()
      .pipe(map(actions => actions.docs.map(a => {
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

  private getFromDb(callback?: (imoveis?: Imovel[]) => void): void {
    this.ngxService.start('getFromDb');
    this.db.list('imoveis').valueChanges().subscribe(value => {
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
      this.db.list('/imoveis', ref => ref.orderByChild('sigla').equalTo(sigla)).valueChanges().subscribe(value => {
        this.ngxService.stop('getBySigla')
        if (callback) callback(value ? value[0] : null);
      });
    }
  }


}