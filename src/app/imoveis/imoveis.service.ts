import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_URL} from '../app.api';
import {Imovel} from './models/imovel.model';
import {Observable} from 'rxjs';


@Injectable()
export class ImoveisService {


  constructor(private http: HttpClient) {}


  imoveis(): Observable<Imovel[]> {
    return this.http.get<Imovel[]>(`${API_URL}/imoveis`);
  }
}
