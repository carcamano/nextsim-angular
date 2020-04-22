import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {ContactForm} from "../imovel/imovel.component";
import {ActivatedRoute} from "@angular/router";
import {AllImoveis} from "../all-imoveis.service";
import {ImovelService} from "../imovel/imovel.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-fab',
  templateUrl: './fab.component.html',
  styleUrls: ['./fab.component.css']
})
export class FabComponent implements OnInit {

  @ViewChild('content') public childModal: NgbModalRef;
  form = new ContactForm('', '', '', '');

  showFab = false;
  constructor(private route: ActivatedRoute,
              private modalService: NgbModal, private service: ImovelService, private toastr: ToastrService) { }

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
    this.form = new ContactForm('', '', '', '' );
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
