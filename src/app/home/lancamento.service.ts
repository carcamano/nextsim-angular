import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {API_URL} from '../app.api';
import {Observable, Subject} from 'rxjs';
import {Lancamento} from "../imoveis/models/lancamento.model";


// const LANCAMENTO_URL = 'http://localhost/buildingeng.com.br';
// const LANCAMENTO_URL = 'http://homolog.nextsim.com.br/lancamentos';
const LANCAMENTO_URL = 'http://admin.nextsim.com.br';
@Injectable()
export class LancamentoService {




  constructor(private http: HttpClient) {
  }


  all(): Observable<HttpResponse<any>> {
    return this.http
      .get<any>(`${LANCAMENTO_URL}/wp-json/wp/v2/portfolio/?_fields[]=id&_fields[]=title&_fields[]=image&_fields[]=slug`, {observe: 'response'});
  }

  slug(slug: string): Observable<Lancamento> {
    return new Observable(subscriber => {
      this.http
        .get<Lancamento[]>(`${LANCAMENTO_URL}/wp-json/wp/v2/portfolio/?slug=${slug}`, {observe: 'response'})
        .subscribe(value => {
          subscriber.next(value.body[0]);
        }, error => subscriber.error(error));

    });
  }

  header(): Observable<any> {
    return new Observable(subscriber => {
      this.http
        .get<Lancamento[]>(`${LANCAMENTO_URL}/wp-json/acf/v3/options/acf-options`, {observe: 'response'})
        .subscribe(value => {
          subscriber.next(value.body);
        }, error => subscriber.error(error));

    });
  }

}
