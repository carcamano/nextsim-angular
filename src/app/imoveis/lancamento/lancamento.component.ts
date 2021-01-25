import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {LancamentoService} from "../../home/lancamento.service";
import {Lancamento} from "../models/lancamento.model";
import {ContactForm} from "../../imovel/imovel.component";
import {NgbCarousel, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ImovelService} from "../../imovel/imovel.service";
import {ToastrService} from "ngx-toastr";
import {NgImageSliderComponent} from "ng-image-slider";
import {NgbSlideEvent} from "@ng-bootstrap/ng-bootstrap/carousel/carousel";
import {OwlOptions} from "ngx-owl-carousel-o";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MASKS} from "ng-brazil";

@Component({
  selector: 'app-lancamento',
  templateUrl: './lancamento.component.html',
  styleUrls: ['./lancamento.component.css']
})
export class LancamentoComponent implements OnInit {

  lancamento: Lancamento;
  form: FormGroup;
  MASKS = MASKS;
  imgs: Array<object>;
  currentPlant = 'plant0';

  @ViewChild('plantas', {static: false}) plantas: NgbCarousel;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: true
  }

  constructor(private route: ActivatedRoute, private lancamentoService: LancamentoService, private formBuilder: FormBuilder,
              private modalService: NgbModal, private toastr: ToastrService, private service: ImovelService) {
  }


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.lancamentoService.slug(params.slug).subscribe(value => {
        console.log(value);
        this.lancamento = value;
        if (this.lancamento && this.lancamento.fields && this.lancamento.fields.planta) {

          this.imgs = this.lancamento.fields.planta.map(value1 => {
            return {
              image: value1.url,
              thumbImage: value1.url,
              title: value1.title
            };
          });
        }
        this.buildForm();
        try {
          window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
        } catch (e) {
          window.scrollTo(0, 0);
        }
      })

    })
  }

  buildForm() {
    this.form = this.formBuilder.group({
      nome: [, Validators.required],
      email: [, [Validators.required, Validators.email]],
      telefone: [],
      mensagem: [],
    })
  }


  submitForm() {
    const form = new FormData();
    form.append('nome', this.form.get('nome').value);
    form.append('email', this.form.get('email').value);
    form.append('telefone', this.form.get('telefone').value);
    form.append('mensagem', this.form.get('mensagem').value);
    this.service.sendToContactForm(form, 505).subscribe(value => {
      console.log(value);
      this.modalService.dismissAll();
      this.toastr.success('Contato enviado!', 'Seus dados foram enviados com sucesso!');
      this.form.reset();
    });
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

    window.open("https://api.whatsapp.com/send?text=http://nextsim.com.br/imoveis/lancamentos/" + this.lancamento.slug, "_blank");

    // https://api.whatsapp.com/send?phone=1996099999&text=https://postcron.com/en/blog/landings/whatsapp-link-generator/#page-block-he6t7wyxoh
  }

  changePlanta(index: number) {
    console.log(index);
    this.plantas.select('plant' + index);

  }

  onSlide(slideEvent: NgbSlideEvent) {
    console.log(slideEvent);
    this.currentPlant = slideEvent.current;
  }

}
