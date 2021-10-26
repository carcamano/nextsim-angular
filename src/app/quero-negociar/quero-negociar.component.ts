import {Component, HostListener, OnInit} from '@angular/core';
import {ContactForm} from '../imovel/imovel.component';
import {LeadService} from '../core/services/lead.service';
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
  constructor(private service: LeadService, private toastr: ToastrService, private formBuilder: FormBuilder) { }

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
    const form = new FormData();
    form.append('nome', this.form.get('nome').value);
    form.append('email', this.form.get('email').value);
    form.append('telefone', this.form.get('telefone').value);
    form.append('categoria', this.form.get('categoria').value);
    form.append('mensagem', this.form.get('mensagem').value);
    this.service.sendToContactForm(form, 505).subscribe(value => {
      this.toastr.success('Contato enviado!', 'Seus dados foram enviados com sucesso!');
      this.form.reset();
    });
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
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



// [text field1]
// [text field2]
// [text field3]
// [text field4]
// [text field5]
// [text field6]
// [text field7]
// [text field8]
// [text field9]
// [text field10]
// [text field11]
// [text field12]
// [text field13]
// [text field14]
// [text field15]
// [text field16]
// [text field17]
// [text field18]
// [text field19]
// [text field20]
// [text field21]
// [text field22]
// [text field23]
// [text field24]
// [text field25]
// [text field26]
// [text field27]
// [text field28]
// [text field29]
// [text field30]
// [text field31]
// [text field32]
// [text field33]
// [text field34]
// [text field35]
// [text field36]
// [text field37]
// [text field38]
// [text field39]
// [text field40]
// [text field41]
// [text field42]
// [text field43]
// [text field44]
// [text field45]
// [text field46]
// [text field47]
// [text field48]
// [text field49]
// [text field50]
// [text field51]
// [text field52]
// [text field53]
// [text field54]
// [text field55]
// [text radio1]
//
//
//
//
//
// [field1]
//   [field2]
//   [field3]
//   [field4]
//   [field5]
//   [field6]
//   [field7]
//   [field8]
//   [field9]
//   [field10]
//   [field11]
//   [field12]
//   [field13]
//   [field14]
//   [field15]
//   [field16]
//   [field17]
//   [field18]
//   [field19]
//   [field20]
//   [field21]
//   [field22]
//   [field23]
//   [field24]
//   [field25]
//   [field26]
//   [field27]
//   [field28]
//   [field29]
//   [field30]
//   [field31]
//   [field32]
//   [field33]
//   [field34]
//   [field35]
//   [field36]
//   [field37]
//   [field38]
//   [field39]
//   [field40]
//   [field41]
//   [field42]
//   [field43]
//   [field44]
//   [field45]
//   [field46]
//   [field47]
//   [field48]
//   [field49]
//   [field50]
//   [field51]
//   [field52]
//   [field53]
//   [field54]
//   [field55]
//   [radio1]
