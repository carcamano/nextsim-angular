import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {ContactForm} from "../imovel/imovel.component";
import {ActivatedRoute} from "@angular/router";
import {LeadService} from "../core/services/lead.service";
import {ToastrService} from "ngx-toastr";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MASKS, NgBrazilValidators} from "ng-brazil";

@Component({
  selector: 'app-fab',
  templateUrl: './fab.component.html',
  styleUrls: ['./fab.component.css']
})
export class FabComponent implements OnInit {

  @ViewChild('content', { static: true }) public childModal: NgbModalRef;
  form: FormGroup;
  MASKS = MASKS;

  showFab = false;
  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder,
              private modalService: NgbModal, private service: LeadService, private toastr: ToastrService) { }

  ngOnInit() {
    this.buildForm();
  }

  showHide(link?:string) {
    this.showFab = !this.showFab;
    if(link) {
      window.open(link);
    }
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
    this.service.sendToContactForm(form, 504).subscribe(value => {
      this.modalService.dismissAll();
      this.toastr.success('Contato enviado!', 'Seus dados foram enviados com sucesso!');
    });
  }

  open(content) {
    this.showHide();
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
