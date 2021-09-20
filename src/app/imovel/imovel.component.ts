import {Component, OnInit, ViewChild} from '@angular/core';
import {Imovel} from '../imoveis/models/imovel.model';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {LeadService} from '../core/services/lead.service';
import {ToastrService} from 'ngx-toastr';
import {AllImoveis} from "../core/services/all-imoveis.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MASKS} from "ng-brazil";
import {HttpClient} from "@angular/common/http";
import {catchError, map} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {environment} from "../../environments/environment";

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

  apiLoaded: Observable<boolean>;

  @ViewChild('content') public childModal: NgbModalRef;

  form: FormGroup;
  MASKS = MASKS;


  constructor(private route: ActivatedRoute, private all: AllImoveis, private formBuilder: FormBuilder,
              private modalService: NgbModal, private service: LeadService, private toastr: ToastrService,
              private router: Router, private httpClient: HttpClient) {

  }

  ngOnInit() {
    this.apiLoaded = this.httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${environment.maps.key}`, 'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );

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

  back(): void {
    this.router.navigate(['/imoveis'], {queryParams: {back: true}})

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
