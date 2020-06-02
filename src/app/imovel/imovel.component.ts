import {Component, OnInit, ViewChild} from '@angular/core';
import {Imovel} from '../imoveis/models/imovel.model';
import {ImoveisService} from '../imoveis/imoveis.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ImovelService} from './imovel.service';
import {HttpClient} from '@angular/common/http';
import {ToastrService} from 'ngx-toastr';
import {AllImoveis} from "../all-imoveis.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MASKS} from "ng-brazil";

@Component({
  selector: 'app-imovel',
  templateUrl: './imovel.component.html',
  styleUrls: ['./imovel.component.css']
})
export class ImovelComponent implements OnInit {

  imovel: Imovel;
  mySlideOptions = {items: 1, dots: true, nav: false};
  myCarouselOptions = {items: 3, dots: true, nav: true};

  imgs: Array<object>;

  @ViewChild('content', { static: false }) public childModal: NgbModalRef;

  form: FormGroup;
  MASKS = MASKS;


  constructor(private route: ActivatedRoute, private all: AllImoveis, private formBuilder: FormBuilder,
              private modalService: NgbModal, private service: ImovelService, private toastr: ToastrService) {

  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      console.log(params)
      this.all.getBySigla(String(params.id).toLocaleUpperCase(), im => {
        console.log(im);
        this.imovel = im;
        this.imageObject();
        this.buildForm();
        try {
          window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
        } catch (e) {
          window.scrollTo(0, 0);
        }
      });
    });

    // cd-google-map
  }

  imageObject(): Array<object> {
    this.imgs = this.imovel.midia.imagens.map(value => {
      return {
        image: value,
        thumbImage: value
      }
    });
    return this.imgs;
  }

  buildForm() {
    this.form = this.formBuilder.group({
      nome: [, Validators.required],
      email: [, [Validators.required, Validators.email]],
      telefone: [],
      mensagem: ['Quero saber mais sobre o imovél: ' + this.imovel.sigla],
    })
  }

  submitForm() {
    console.log(this.form);
    const form = new FormData();
    form.append('nome', this.form.get('nome').value);
    form.append('email', this.form.get('email').value);
    form.append('telefone', this.form.get('telefone').value);
    form.append('mensagem', this.form.get('mensagem').value);
    this.service.sendToContactForm(form, 504).subscribe(value => {
      console.log(value);
      this.modalService.dismissAll();
      this.toastr.success('Contato enviado!', 'Seus dados foram enviados com sucesso!');
    });
  }


  getFormattedPrice(price: number) {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(price).replace(',00', '');
  }

  anualOrMonth(label?: string) {
    let l = 'mês';
    if (label === 'anual') {
      l = 'anual'
    }
    return l;
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

  whatsapp() {

    window.open("https://api.whatsapp.com/send?text=http://nextsim.com.br/imoveis/" + this.imovel.sigla, "_blank");

    // https://api.whatsapp.com/send?phone=1996099999&text=https://postcron.com/en/blog/landings/whatsapp-link-generator/#page-block-he6t7wyxoh
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
