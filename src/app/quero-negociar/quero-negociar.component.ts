import {Component, HostListener, OnInit} from '@angular/core';
import {ContactForm} from '../imovel/imovel.component';
import {ImovelService} from '../imovel/imovel.service';
import {ToastrService} from 'ngx-toastr';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MASKS} from "ng-brazil";

@Component({
  selector: 'app-quero-negociar',
  templateUrl: './quero-negociar.component.html',
  styleUrls: ['./quero-negociar.component.css']
})
export class QueroNegociarComponent implements OnInit {

  height = 0;

  form: FormGroup;
  MASKS = MASKS;
  constructor(private service: ImovelService, private toastr: ToastrService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.height = window.outerHeight;
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }

    this.form = this.formBuilder.group({
      nome: [, Validators.required],
      email: [, [Validators.required, Validators.email]],
      categoria: [, Validators.required],
      telefone: [],
      mensagem: [],
    })
  }

  submitForm() {
    console.log(this.form);
    const form = new FormData();
    form.append('nome', this.form.get('nome').value);
    form.append('email', this.form.get('email').value);
    form.append('telefone', this.form.get('telefone').value);
    form.append('categoria', this.form.get('categoria').value);
    form.append('mensagem', this.form.get('mensagem').value);
    this.service.sendToContactForm(form, 505).subscribe(value => {
      console.log(value);
      this.toastr.success('Contato enviado!', 'Seus dados foram enviados com sucesso!');
      this.form.reset();
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
