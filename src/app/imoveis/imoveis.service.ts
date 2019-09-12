import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {API_URL} from '../app.api';
import {Imovel} from './models/imovel.model';
import {Observable, Subject} from 'rxjs';


@Injectable()
export class ImoveisService {



  constructor(private http: HttpClient) {
  }


  imoveis(params: any, page = 1): Observable<HttpResponse<Imovel[]>> {
    const finalidade = params.finalidade;
    const tipo = params.tipo;
    const dormitorios = params.quartos;
    const aluguel = params.categoria === 'alugar' ? true : false;
    const venda = params.categoria === 'comprar' ? true : false;

    let p = new HttpParams();
    p = p.append('_start', String((page - 1) * 10));
    p = p.append('_limit', '10');
    if (finalidade) {
      p = p.append('finalidade', finalidade);
    }
    if (tipo) {
      p = p.append('tipo', tipo);
    }
    if (aluguel) {
      p = p.append('comercializacao.locacao.ativa', aluguel.toString());
    }

    if (dormitorios) {
      p = p.append('numeros.dormitorios', dormitorios.toString());

    }
    if (venda) {
      p = p.append('comercializacao.venda.ativa', venda.toString());
    }

    return this.http
      .get<Imovel[]>(`${API_URL}/imoveis`, {observe: 'response', params: p});

  }

  all(): Observable<Imovel[]> {

    return this.http
      .get<Imovel[]>(`${API_URL}/imoveis`);

  }

  imoveisBySigla(sigla: string): Observable<Imovel> {
    return this.http.get<Imovel>(`${API_URL}/imoveis?sigla=${sigla}`);
  }
}
