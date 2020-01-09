import {Injectable} from '@angular/core';
import {AngularFireDatabase} from "@angular/fire/database";
import {NgxUiLoaderService} from "ngx-ui-loader";
import * as jsonpack from "jsonpack";


@Injectable({
  providedIn: 'root',
})
export class AllImoveis {

  imoveis: any[];

  constructor(private db: AngularFireDatabase, private ngxService: NgxUiLoaderService) {
    this.getAll();
  }

  getAll(callback?: () => void) {

    try {
      let lastUpdate = localStorage.getItem('nextsim_lastUpdate');
      const localImoveis = localStorage.getItem('nextsim_imoveis');
      if (localImoveis) {
        this.imoveis = jsonpack.unpack(localImoveis);
      } else {
        this.getFromDb(callback);
      }
    } catch (e) {
      console.log(e);
      this.getFromDb(callback);
    }


  }

  private getFromDb(callback?: () => void): void {
    this.ngxService.start('AllImoveisgetAll');

    this.db.list('imoveis').valueChanges().subscribe(value => {
      this.ngxService.stop('AllImoveisgetAll');
      this.imoveis = value;
      try {
        localStorage.setItem('nextsim_imoveis', jsonpack.pack(value));
      } catch (e) {
        console.log(e);
        localStorage.clear();
        try {
          localStorage.setItem('nextsim_imoveis', jsonpack.pack(value));
        } catch (ee) {
          console.log(ee);
        }
      }
      if (callback) callback();
    });
  }

  getBySigla(sigla: string, callback?: (imovel?: any) => void) {
    this.db.list('/imoveis', ref => ref.orderByChild('sigla').equalTo(sigla)).valueChanges().subscribe(value => {
      if (callback) callback(value ? value[0] : null);
    });
  }


}
