import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {API_URL} from '../app.api';
import {Imovel} from './models/imovel.model';
import {Observable, Subject} from 'rxjs';


@Injectable()
export class GeneralService {



  constructor(private http: HttpClient) {
  }


  tipos(): Observable<HttpResponse<string[]>> {
    return this.http
      .get<string[]>(`${API_URL}/tipos`, {observe: 'response'});

  }

  precos(): Observable<HttpResponse<string[]>> {
    return this.http
      .get<string[]>(`${API_URL}/precos`, {observe: 'response'});

  }

  area(): Observable<HttpResponse<string[]>> {
    return this.http
      .get<string[]>(`${API_URL}/area`, {observe: 'response'});

  }
}
