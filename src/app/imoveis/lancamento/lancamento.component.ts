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

@Component({
  selector: 'app-lancamento',
  templateUrl: './lancamento.component.html',
  styleUrls: ['./lancamento.component.css']
})
export class LancamentoComponent implements OnInit {

  lancamento: Lancamento;
  form = new ContactForm('', '', '', 'Quero saber mais sobre o imovél: ');
  imgs: Array<object>;
  currentPlant = 'plant0';

  @ViewChild('plantas') plantas: NgbCarousel;
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

  constructor(private route: ActivatedRoute, private lancamentoService: LancamentoService,
              private modalService: NgbModal, private toastr: ToastrService,  private service: ImovelService) { }


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.lancamentoService.slug(params.slug).subscribe(value => {
        console.log(value);
        this.lancamento = value;
        this.imgs = this.lancamento.fields.planta.map(value1 => {
          return {
            image: value1.url,
            thumbImage: value1.url,
            title: value1.title
          };
        });
        this.buildForm()
      })

    })
  }

  buildForm() {
    this.form = new ContactForm('', '', '', 'Quero saber mais sobre o lançamento: ' + this.lancamento.title.rendered);
  }

  submitForm() {
    console.log(this.form);
    this.service.sendGrid(this.form).subscribe(value => {
      console.log(value);
      this.modalService.dismissAll();
      this.toastr.success('Contato enviado!', 'Seus dados foram enviados com sucesso!');
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
