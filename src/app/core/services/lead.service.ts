import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ContactForm} from '../../imovel/imovel.component';
import {Imovel} from '../../imoveis/models/imovel.model';
import {isArray, isBoolean, isNull} from 'lodash';


const APIGESTAO_URL = 'https://api-atendimentos.gestaoreal.com.br';

@Injectable()
export class LeadService {


  constructor(private http: HttpClient) {
  }


  sendToContactFormAny(form: any, formId: number) {
    const formData = new FormData();
    // tslint:disable-next-line:forin
    for (const k in form) {
      if (isArray(form[k])) {
        formData.append(k, form[k].map(el => {
          return `<a href="${el}">Link</a>`;
        }).join('.'));
      } else if (isBoolean(form[k])) {
        if (form[k]) {
          formData.append(k, 'Sim');
        } else {
          formData.append(k, 'Não');
        }
      } else {
        formData.append(k, form[k]);
      }
    }

    return this.sendToContactForm(formData, formId);

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
