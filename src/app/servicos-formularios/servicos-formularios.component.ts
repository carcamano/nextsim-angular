import {AfterViewInit, Component, EventEmitter, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {Observable} from "rxjs/Rx";
import {finalize} from "rxjs/operators";
import {ToastrService} from "ngx-toastr";
import {LeadService} from "../core/services/lead.service";
import { MASKS } from 'ng-brazil';

@Component({
  selector: 'app-servicos-formularios',
  templateUrl: './servicos-formularios.component.html',
  styleUrls: ['./servicos-formularios.component.scss']
})
export class ServicosFormulariosComponent implements OnInit, AfterViewInit {

  showForm1 = false;
  showForm2 = false;
  showForm3 = false;
  showForm4 = false;
  showForm5 = false;
  showForm6 = false;
  showForm7 = false;
  showForm8 = false;
  showForm9 = false;

  imgBoleto = 1;


  downloadURL: Observable<string>;
  sending = false;
  path = 'files';
  image: string;

  // form 1 Contrato pessoa fisica 39
  form1: FormGroup;

  // form 2 CADASTRO DE PESSOA JURÍDICA 28
  form2: FormGroup;

  // LOCADOR 55
  form3: FormGroup;

  // AVISO DE DESOCUPAÇÃO 13
  form4: FormGroup;

  // ANUNCIE O SEU IMÓVEL 27
  form5: FormGroup;

  // PROPOSTA DE LOCAÇÃO 11 com checkbox
  form6: FormGroup;

  // PROPOSTA DE COMPRA 13
  form7: FormGroup;

  public MASKS = MASKS;


  constructor(private location: Location, private modalService: NgbModal, private formBuilder: FormBuilder,
              private storage: AngularFireStorage, private toastr: ToastrService, private sendService: LeadService) {}

  ngOnInit() {
    this.form1 = this.formBuilder.group({
      radio1: [, Validators.required],
      field1: [, Validators.required],
      field2: [, Validators.required],
      field3: [, Validators.required],
      field4: [, Validators.required],
      field5: [, Validators.required],
      field6: [, Validators.required],
      field7: [, Validators.required],
      field8: [, Validators.required],
      field9: [, Validators.required],
      field10: [, Validators.required],
      field11: [, Validators.required],
      field12: [, Validators.required],
      field13: [, Validators.required],
      field14: [, Validators.required],
      field15: [, Validators.required],
      field16: [, Validators.required],
      field17: [, Validators.required],
      field18: [, Validators.required],
      field19: [, Validators.required],
      field20: [, Validators.required],
      field21: [, Validators.required],
      field22: [, Validators.required],
      field23: [, Validators.required],
      field24: [, Validators.required],
      field25: [, Validators.required],
      field26: [, Validators.required],
      field27: [, Validators.required],
      field28: [, Validators.required],
      field29: [, Validators.required],
      field30: [, Validators.required],
      field31: [, Validators.required],
      field32: [, Validators.required],
      field33: [, Validators.required],
      field34: [, Validators.required],
      field35: [, Validators.required],
      field36: [, Validators.required],
      field37: [, Validators.required],
      field38: [, Validators.required],
      field39: [, Validators.required],
    });

    this.form2 = this.formBuilder.group({
      radio1: [, Validators.required],
      field1: [, Validators.required],
      field2: [, Validators.required],
      field3: [, [Validators.required, Validators.email]],
      field4: [, Validators.required],
      field5: [, Validators.required],
      field6: [, Validators.required],
      field7: [, Validators.required],
      field8: [, Validators.required],
      field9: [, Validators.required],
      field10: [, Validators.required],
      field11: [, Validators.required],
      field12: [, Validators.required],
      field13: [, Validators.required],
      field14: [, Validators.required],
      field15: [, Validators.required],
      field16: [, Validators.required],
      field17: [, Validators.required],
      field18: [, Validators.required],
      field19: [, Validators.required],
      field20: [, Validators.required],
      field21: [, Validators.required],
      field22: [, Validators.required],
      field23: [, Validators.required],
      field24: [, Validators.required],
      field25: [, Validators.required],
      field26: [, Validators.required],
      field27: [, Validators.required],
    });

    this.form3 = this.formBuilder.group({
      radio1: [, Validators.required],
      field1: [, Validators.required],
      field2: [, Validators.required],
      field3: [, Validators.required],
      field4: [, Validators.required],
      field5: [, Validators.required],
      field6: [, Validators.required],
      field7: [, Validators.required],
      field8: [, Validators.required],
      field9: [, Validators.required],
      field10: [, Validators.required],
      field11: [, Validators.required],
      field12: [, Validators.required],
      field13: [, Validators.required],
      field14: [, Validators.required],
      field15: [, Validators.required],
      field16: [, Validators.required],
      field17: [, Validators.required],
      field18: [, Validators.required],
      field19: [, Validators.required],
      field20: [, Validators.required],
      field21: [, Validators.required],
      field22: [, Validators.required],
      field23: [, Validators.required],
      field24: [, Validators.required],
      field25: [, Validators.required],
      field26: [, Validators.required],
      field27: [, Validators.required],
      field28: [, Validators.required],
      field29: [, Validators.required],
      field30: [, Validators.required],
      field31: [, Validators.required],
      field32: [, Validators.required],
      field33: [, Validators.required],
      field34: [, Validators.required],
      field35: [, Validators.required],
      field36: [, Validators.required],
      field37: [, Validators.required],
      field38: [, Validators.required],
      field39: [, Validators.required],
      field40: [, Validators.required],
      field41: [, Validators.required],
      field42: [, Validators.required],
      field43: [, Validators.required],
      field44: [, Validators.required],
      field45: [, Validators.required],
      field46: [, Validators.required],
      field47: [, Validators.required],
      field48: [, Validators.required],
      field49: [, Validators.required],
      field50: [, Validators.required],
      field51: [, Validators.required],
      field52: [, Validators.required],
      field53: [, Validators.required],
      field54: [, Validators.required],
    });


    this.form4 = this.formBuilder.group({
      field1: [, Validators.required],
      field2: [, Validators.required],
      field3: [, Validators.required],
      field4: [, Validators.required],
      field5: [, Validators.required],
      field6: [, Validators.required],
      field7: [, Validators.required],
      field8: [, Validators.required],
      field9: [, Validators.required],
      field10: [, Validators.required],
      field11: [, Validators.required],
      field12: [, Validators.required],
      field13: [, ],

    });

    this.form5 = this.formBuilder.group({
      field1: [, Validators.required],
      field2: [, Validators.required],
      field3: [, Validators.required],
      field4: [, Validators.required],
      field5: [, Validators.required],
      field6: [, Validators.required],
      field7: [, Validators.required],
      field8: [, Validators.required],
      field9: [, Validators.required],
      field10: [, Validators.required],
      field11: [, Validators.required],
      field12: [, Validators.required],
      field13: [, Validators.required],
      field14: [, Validators.required],
      field15: [, Validators.required],
      field16: [, Validators.required],
      field17: [, Validators.required],
      field18: [, Validators.required],
      field19: [, Validators.required],
      field20: [, Validators.required],
      field21: [, Validators.required],
      field22: [, Validators.required],
      field23: [, Validators.required],
      field24: [, Validators.required],
      field25: [, Validators.required],
      field26: [, Validators.required],
      field27: [, ],
    });

    this.form6 = this.formBuilder.group({
      radio1: [, Validators.required],
      field1: [, Validators.required],
      field2: [, Validators.required],
      field3: [, Validators.required],
      field4: [, Validators.required],
      field5: [, Validators.required],
      field6: [, Validators.required],
      field7: [, Validators.required],
      field8: [, Validators.required],
      field9: [, Validators.required],
      field10: [, Validators.required],
      field11: [, Validators.required],
      field12: [, Validators.required],
      field13: [, Validators.required],
      field14: [, Validators.required],
    });

    this.form7 = this.formBuilder.group({
      field1: [, Validators.required],
      field2: [, Validators.required],
      field3: [, Validators.required],
      field4: [, Validators.required],
      field5: [, Validators.required],
      field6: [, Validators.required],
      field7: [, Validators.required],
      field8: [, Validators.required],
      field9: [, Validators.required],
      field10: [, Validators.required],
      field11: [, Validators.required],
      field12: [, Validators.required],
      field13: [, Validators.required],
      field14: [, Validators.required],
    });
  }

  ngAfterViewInit() {
    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }


  mToggle(event) {

  }

  none(){

  }

  submit1() {
    if (this.form1.valid) {
      this.sendForm(this.form1.getRawValue(), 723);
    } else {
      this.errorForm();
    }
  }
  submit2() {
    if (this.form2.valid) {
      console.log('valido 2');
      this.sendForm(this.form2.getRawValue(), 724);
    } else {
      console.log('invalido 2');
      this.errorForm();
    }
  }
  submit3() {
    console.log(this.form3.getRawValue());
    if (this.form3.valid) {
      console.log('valido 3');
      this.sendForm(this.form3.getRawValue(), 725);
    } else {
      console.log('invalido 3');
      this.errorForm();
    }
  }
  submit4() {
    console.log(this.form4.getRawValue());
    if (this.form4.valid) {
      console.log('valido 4');
      this.sendForm(this.form4.getRawValue(), 726);
    } else {
      console.log('invalido 4');
      this.errorForm();
    }
  }
  submit5() {
    console.log(this.form5.getRawValue());
    if (this.form5.valid) {
      console.log('valido 5');
      this.sendForm(this.form5.getRawValue(), 727);
    } else {
      console.log('invalido 5');
      this.errorForm();
    }
  }
  submit6() {
    console.log(this.form6.getRawValue());
    if (this.form6.valid) {
      console.log('valido 6');
      this.sendForm(this.form6.getRawValue(), 728);
    } else {
      console.log('invalido 6');
      this.errorForm();
    }
  }
  submit7() {
    console.log(this.form7.getRawValue());
    if (this.form7.valid) {
      console.log('valido 7');
      this.sendForm(this.form7.getRawValue(), 729);
    } else {
      console.log('invalido 7');
      this.errorForm();
    }
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      centered: true
    }).result.then((result) => {
    }, (reason) => {
    });
  }


  goBack() {
    this.location.back();
  }


  //uploader

  onFileChange(event, small, el) {
    if (event.target.files && event.target.files.length) {
      const theFile = event.target.files[0];
      console.log(theFile);
      this.upload(theFile, small, el);
    }
  }

  private upload(file: File, small: HTMLElement, el: FormControl) {
    this.sending = true;
    const n = Date.now();
    small.innerText = 'Carregando...';
    const filePath = `${this.path}/${n}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`${this.path}/${n}`, file);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe(url => {
            if (url) {
              small.innerText = file.name;
              el.setValue(url)
              this.image = url;
            }
            this.sending = false;
          });
        })
      )
      .subscribe();
  }


  private errorForm() {
    this.toastr.error('Formulário incompleto!', 'Preencha todos os campos do formulario!');
  }

  private successForm() {
    this.toastr.success('Formulário Enviado!', 'Seus dados foram enviados com sucesso!');
  }

  private sendForm(rowValue: any, formId: number) {
    this.sendService.sendToContactFormAny(rowValue, formId)
      .subscribe(value => {
        this.successForm();
        console.log(value);
        this.form1.reset();
        this.form2.reset();
        this.form3.reset();
        this.form4.reset();
        this.form5.reset();
        this.form6.reset();
        this.form7.reset();
      });
  }


}
