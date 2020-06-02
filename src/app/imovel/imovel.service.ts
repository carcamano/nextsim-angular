import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {ContactForm} from './imovel.component';
import {Imovel} from '../imoveis/models/imovel.model';
import {ToastrService} from 'ngx-toastr';


const APIGESTAO_URL = 'https://api-atendimentos.gestaoreal.com.br';

@Injectable()
export class ImovelService {


  constructor(private http: HttpClient) {
  }


  sendGrid(form: any, imovel?: Imovel): Observable<HttpResponse<any>> {

    return this.http
      .post<any>('https://us-central1-promocao-bosch-service.cloudfunctions.net/sendEmailNext', {
        nome: form.nome,
        telefone: form.telefone,
        email: form.email,
        texto: form.texto,
        to: 'leads@nextsim.com.br',
        subject: 'Contato Site Next'
      });
  }

  sendToContactForm(form: FormData, formId: number) {
    return this.http
      .post<any>(`https://admin.nextsim.com.br/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`, form);
  }


  incluir(form: ContactForm, imovel: Imovel): Observable<HttpResponse<any>> {

    const authorizationData = 'Basic ' + btoa('5796bc63c096d580178b4575:11e42072bb3d7b0443dc46f491b531f5');

    const headerOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: authorizationData
      })
    };
    console.log(authorizationData);
    console.log(headerOptions);
    let interesse = 0;
    try {
      if (imovel.comercializacao.locacao.ativa) {
        interesse = 1;
      }
    } catch (e) {

    }
    return this.http
      .post<any>(`${APIGESTAO_URL}/incluir`, {
        nome: form.nome,
        telefone: Number(form.telefone),
        email: form.email,
        texto: form.texto,
        interesse,
        midia: 0,
        imovel: {
          _id: imovel._id,
          sigla: imovel.sigla
        },
        requisicao: {
          nome: 6,
          codigo: Math.floor(Math.random() * 1000).toString()
        }
      }, headerOptions);

  }

}
