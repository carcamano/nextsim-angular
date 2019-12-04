import {Component, HostListener, OnInit} from '@angular/core';
import {ContactForm} from '../imovel/imovel.component';
import {ImovelService} from '../imovel/imovel.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-quero-negociar',
  templateUrl: './quero-negociar.component.html',
  styleUrls: ['./quero-negociar.component.css']
})
export class QueroNegociarComponent implements OnInit {

  height = 0;

  form = new ContactFormNegociar('', '', '', 'Quero saber mais sobre o imovél: ');
  constructor(private service: ImovelService, private toastr: ToastrService) { }

  ngOnInit() {
    this.height = window.outerHeight;
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  submitForm() {
    console.log(this.form);
    this.service.sendGrid(this.form, null).subscribe(value => {
      console.log(value);
      this.toastr.success('Contato enviado!', 'Seus dados foram enviados com sucesso!');
    });
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    console.log(event);
    this.height = window.innerHeight;
  }
}

export class ContactFormNegociar {
  constructor(
    public nome: string,
    public telefone: string,
    public email: string,
    public texto?: string,
    public categoria?: string,
    public interesse = 0,
    public midia = 0,
  ) {
  }
}
