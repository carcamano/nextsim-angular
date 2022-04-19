import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Lancamento} from "../../imoveis/models/lancamento.model";


// const LANCAMENTO_URL = 'http://localhost/buildingeng.com.br';
// const LANCAMENTO_URL = 'http://homolog.nextsim.com.br/lancamentos';
const LANCAMENTO_URL = 'https://admin.nextsim.com.br';

@Injectable({providedIn: 'root'})
export class WPService {

  corretores: any[];

  constructor(private http: HttpClient) {
  }


  all(): Observable<HttpResponse<any>> {
    return this.http
      .get<any>(`${LANCAMENTO_URL}/wp-json/wp/v2/portfolio/?_fields[]=id&_fields[]=title&_fields[]=image&_fields[]=slug&per_page=100`, {observe: 'response'});
  }

  slug(slug: string): Observable<Lancamento> {
    return new Observable(subscriber => {
      this.http
        .get<Lancamento[]>(`${LANCAMENTO_URL}/wp-json/wp/v2/portfolio/?slug=${slug}&per_page=100`, {observe: 'response'})
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
          this.corretores = (value.body as any).acf.corretores;
          subscriber.next(value.body);
        }, error => subscriber.error(error));

    });
  }

  options(): Observable<any> {
    return new Observable(subscriber => {
      this.http
        .get<Lancamento[]>(`${LANCAMENTO_URL}/wp-json/acf/v3/options/acf-options`, {observe: 'response'})
        .subscribe(value => {
          this.corretores = (value.body as any).acf.corretores;
          subscriber.next(value.body);
        }, error => subscriber.error(error));

    });
  }

  sobreNos(): Observable<any> {
    return new Observable(subscriber => {
      this.http
        .get<Lancamento[]>(`${LANCAMENTO_URL}/wp-json/wp/v2/pages?slug=sobre-nos&per_page=100`, {observe: 'response'})
        .subscribe(value => {
          subscriber.next(value.body);
        }, error => subscriber.error(error));

    });
  }

  posts(categoryId?: number): Observable<any> {
    return new Observable(subscriber => {
      this.http
        .get<Lancamento[]>(`${LANCAMENTO_URL}/wp-json/wp/v2/posts?status=publish&per_page=100${categoryId ? `&categories=${categoryId}` : ''}`, {observe: 'response'})
        .subscribe(value => {
          subscriber.next(value.body);
        }, error => subscriber.error(error));

    });
  }

  taxonomies(): Observable<any> {
    return new Observable(subscriber => {
      this.http
        .get<Lancamento[]>(`${LANCAMENTO_URL}/wp-json/wp/v2/categories`, {observe: 'response'})
        .subscribe(value => {
          subscriber.next(value.body);
        }, error => subscriber.error(error));

    });
  }

  post(slug: string) {
    return new Observable(subscriber => {
      this.http
        .get<Lancamento[]>(`${LANCAMENTO_URL}/wp-json/wp/v2/posts?status=publish&slug=${slug}&per_page=100`, {observe: 'response'})
        .subscribe(value => {
          subscriber.next(value.body);
        }, error => subscriber.error(error));

    });

  }

}
