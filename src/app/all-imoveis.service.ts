import {Injectable} from '@angular/core';
import {AngularFireDatabase} from "@angular/fire/database";
import {NgxUiLoaderService} from "ngx-ui-loader";

@Injectable({
  providedIn: 'root',
})
export class AllImoveis {

  imoveis: any[];

  constructor(private db: AngularFireDatabase, private ngxService: NgxUiLoaderService) {
    console.log('init Globals');
    this.getAll();
  }

  getAll(callback?: () => void) {
    this.ngxService.start('AllImoveisgetAll');
    this.db.list('imoveis').valueChanges().subscribe(value => {
      this.ngxService.stop('AllImoveisgetAll');
      this.imoveis = value;
      if (callback) callback();
    });
  }

  getBySigla(sigla: string, callback?: (imovel?: any) => void) {
    this.db.list('/imoveis', ref => ref.orderByChild('sigla').equalTo(sigla)).valueChanges().subscribe(value => {
      if (callback) callback(value ? value[0] : null);
    });
  }


}
