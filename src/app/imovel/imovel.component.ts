import {Component, OnInit, ViewChild} from '@angular/core';
import {Imovel} from '../imoveis/models/imovel.model';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {LeadService} from '../core/services/lead.service';
import {ToastrService} from 'ngx-toastr';
import {AllImoveis} from "../core/services/all-imoveis.service";
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

  imageheight = (window.innerWidth > 1300 ? 500 : (window.innerWidth > 992 ? 480 : 300)) + 'px';

  imgs: Array<object>;

  @ViewChild('content') public childModal: NgbModalRef;

  form: FormGroup;
  MASKS = MASKS;


  constructor(private route: ActivatedRoute, private all: AllImoveis, private formBuilder: FormBuilder,
              private modalService: NgbModal, private service: LeadService, private toastr: ToastrService) {

  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      console.log(params)
      this.all.getBySigla(String(params.id).toLocaleUpperCase()).subscribe( (im: Imovel[]) => {
        console.log(im);
        this.imovel = im[0];
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

  scroll() {
    document.getElementById('down-arrow').scrollIntoView({behavior: "smooth"});
  }

  imageObject(): Array<object> {
    if (this.imovel.midia.imagens) {
      this.imgs = this.imovel.midia.imagens.map(value => {
        return {
          image: value,
          thumbImage: value
        }
      });
    }
    if (this.imovel.midia.fotoscond) {
      this.imovel.midia.fotoscond.map(value => {
        return {
          image: value,
          thumbImage: value
        }
      }).forEach(value => this.imgs.push(value));
    }
    console.log(this.imgs);
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
