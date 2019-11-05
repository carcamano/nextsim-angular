import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {API_URL} from '../app.api';
import {Observable, Subject} from 'rxjs';


// const LANCAMENTO_URL = 'http://localhost/buildingeng.com.br';
const LANCAMENTO_URL = 'http://homolog.nextsim.com.br/lancamentos';
@Injectable()
export class LancamentoService {




  constructor(private http: HttpClient) {
  }


  all(): Observable<HttpResponse<any>> {

    return this.http
      .get<any>(`${LANCAMENTO_URL}/wp-json/wp/v2/portfolio/`, {observe: 'response'});

  }

}
