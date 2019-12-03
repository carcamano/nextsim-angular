import {Component, OnInit, ViewChild} from '@angular/core';
import {Imovel} from '../imoveis/models/imovel.model';
import {ImoveisService} from '../imoveis/imoveis.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ImovelService} from './imovel.service';
import {HttpClient} from '@angular/common/http';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-imovel',
  templateUrl: './imovel.component.html',
  styleUrls: ['./imovel.component.css']
})
export class ImovelComponent implements OnInit {

  imovel: Imovel;
  mySlideOptions = {items: 1, dots: true, nav: false};
  myCarouselOptions = {items: 3, dots: true, nav: true};

  @ViewChild('content') public childModal: NgbModalRef;

  form = new ContactForm('', '', '', 'Quero saber mais sobre o imovél: ');


  constructor(private route: ActivatedRoute, private imoveisService: ImoveisService,
              private modalService: NgbModal, private service: ImovelService, private toastr: ToastrService) {

  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      console.log(params)
      this.imoveisService.imoveisBySigla(params.id).subscribe((value: Imovel) => {
      console.log(value)
        this.imovel = value[0];
        this.form = new ContactForm('', '', '', 'Quero saber mais sobre o imovél: ' + this.imovel.sigla);
        console.log(this.imovel);
      });
    });

    // cd-google-map
  }

  submitForm() {
    console.log(this.form);
    this.service.incluir(this.form, this.imovel).subscribe(value => {
      console.log(value);
      this.modalService.dismissAll();
      this.toastr.success('Contato enviado!', 'Seus dados foram enviados com sucesso!');
    });
  }


  getFormattedPrice(price: number) {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(price);
  }


  toArea(imovel: Imovel) {
    if (imovel.tipo === 'casa') {
      const total = imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      const util = imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
    } else if (imovel.tipo === 'apartamento' || imovel.tipo === 'sala') {
      const num = imovel.numeros.areas.util.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
    } else if (imovel.tipo === 'terreno') {
      const num = imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
    }
    return '?';
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      // @ts-ignore
      size: 'md',
      centered: true
    }).result.then((result) => {
    }, (reason) => {
    });
  }

}


export class ContactForm {
  constructor(
    public nome: string,
    public telefone: string,
    public email: string,
    public texto?: string,
    public interesse = 0,
    public midia = 0
  ) {
  }
}
