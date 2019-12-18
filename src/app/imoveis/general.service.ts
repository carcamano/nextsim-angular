import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {API_URL} from '../app.api';
import {Imovel} from './models/imovel.model';
import {Observable, Subject} from 'rxjs';


@Injectable()
export class GeneralService {



  constructor(private http: HttpClient) {
  }


  tipos_comercial(): Observable<HttpResponse<string[]>> {
    return this.http
      .get<string[]>(`${API_URL}/tipos_comercial`, {observe: 'response'});

  }

  tipos_residencial(): Observable<HttpResponse<string[]>> {
    return this.http
      .get<string[]>(`${API_URL}/tipos_residencial`, {observe: 'response'});

  }

  precos(): Observable<HttpResponse<string[]>> {
    return this.http
      .get<string[]>(`${API_URL}/precos`, {observe: 'response'});

  }

  area(): Observable<HttpResponse<string[]>> {
    return this.http
      .get<string[]>(`${API_URL}/area`, {observe: 'response'});

  }

  locais(): Observable<HttpResponse<any>> {
    return this.http
      .get<string[]>(`${API_URL}/locais`, {observe: 'response'});

  }

  locais_residencial(): Observable<HttpResponse<any>> {
    return this.http
      .get<string[]>(`${API_URL}/locais_residencial`, {observe: 'response'});

  }

  locais_comercial(): Observable<HttpResponse<any>> {
    return this.http
      .get<string[]>(`${API_URL}/locais_comercial`, {observe: 'response'});

  }


  autocomplete(): Observable<HttpResponse<any>> {
    return this.http
      .get<string[]>(`${API_URL}/autocomplete`, {observe: 'response'});

  }
}
