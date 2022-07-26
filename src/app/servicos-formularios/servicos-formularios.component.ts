import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AngularFireStorage} from '@angular/fire/compat/storage';
// tslint:disable-next-line:import-blacklist
import {Observable} from 'rxjs/Rx';
import {filter, finalize, switchMap} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {LeadService} from '../core/services/lead.service';
import {MASKS} from 'ng-brazil';
import {WPService} from '../core/services/w-p.service';
import {from} from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-servicos-formularios',
  templateUrl: './servicos-formularios.component.html',
  styleUrls: ['./servicos-formularios.component.scss']
})
export class ServicosFormulariosComponent implements OnInit, AfterViewInit {

  corretores: any[] = [];
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
  FORM1_ID = 723;

  // form 2 CADASTRO DE PESSOA JURÍDICA 28
  form2: FormGroup;
  FORM2_ID = 724;

  // LOCADOR 55
  form3: FormGroup;
  FORM3_ID = 725;

  // AVISO DE DESOCUPAÇÃO 13
  form4: FormGroup;
  FORM4_ID = 726;

  // ANUNCIE O SEU IMÓVEL 27
  form5: FormGroup;
  FORM5_ID = 727;

  // PROPOSTA DE LOCAÇÃO 11 com checkbox
  form6: FormGroup;
  FORM6_ID = 728;

  // PROPOSTA DE COMPRA 13
  form7: FormGroup;
  FORM7_ID = 729;

  public MASKS = MASKS;


  constructor(private location: Location, private modalService: NgbModal, private formBuilder: FormBuilder,
              private storage: AngularFireStorage, private toastr: ToastrService, private sendService: LeadService,
              private wpService: WPService) {
  }

  ngOnInit() {
    // PF
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
      field15: [,],
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
      field28: [,],
      field29: [,],
      field30: [, Validators.required],
      field31: [, Validators.required],
      field32: [, Validators.required],
      field33: [, Validators.required],
      field34: [, Validators.required],
      field35: [, Validators.required],
      field36: [,],
      field37: [,],
      field38: [,],
      field39: [,],
    });

    // PJ
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
      field28: [, Validators.required],
      field29: [, Validators.required],
      field30: [, Validators.required],
      field31: [, Validators.required],
      field32: [, Validators.required],
      field33: [, Validators.required],
      field34: [, Validators.required],
      field35: [, Validators.required],
      field36: [, Validators.required],
      field37: [,],
      field38: [,],
      field39: [,],
      field40: [,],
      field41: [,],
      field42: [,],
      field43: [,],
      field44: [,],
      field45: [,],
      field46: [, Validators.required], // corretor
    });

    // Locador
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
      field25: [,],
      field26: [,],
      field27: [,],
      field28: [,],
      field29: [,],
      field30: [,],
      field31: [,],
      field32: [,],
      field33: [,],
      field34: [,],
      field35: [,],
      field36: [,],
      field37: [,],
      field38: [,],
      field40: [, Validators.required],
      field41: [, Validators.required],
      field42: [, Validators.required],
      field43: [, Validators.required],
      field44: [, Validators.required],
      field45: [,],
      field46: [,],
      field47: [,],
      field48: [,],
      field49: [,],
      field50: [,],
      field51: [,],
      field52: [,],
      field53: [,],
      field54: [,],
      field55: [, Validators.required],
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
      field13: [,],

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
      field20: [,],
      field21: [, Validators.required],
      field22: [, Validators.required],
      field23: [, Validators.required],
      field24: [, Validators.required],
      field25: [, Validators.required],
      field26: [, Validators.required],
      field27: [,],
    });

    this.form6 = this.formBuilder.group({
      radio1: [, Validators.required],
      field1: [, Validators.required],
      field2: [, Validators.required],
      field3: [, Validators.required],
      field4: [, Validators.required],
      field5: [, Validators.required],
      field6: [,],
      field7: [,],
      field8: [,],
      field9: [,],
      field10: [,],
      field11: [, Validators.required],
      field12: [, Validators.required],
      field13: [, Validators.required],
      field14: [, Validators.required],
      field15: [, Validators.required],
      field16: [,],
      field17: [,],
      field18: [,],
      field19: [, Validators.required], // corretor
      field20: [,], // OBS
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
      field14: [, Validators.required], // corretor
      field15: [, Validators.required],
      field16: [,],
      field17: [,],
      field18: [,],
      field19: [,], // obs
    });
  }

  ngAfterViewInit() {
    if (!this.wpService.corretores) {
      this.wpService.options().subscribe(() => {
        this.setupCorretores();
      });
    } else {
      this.setupCorretores();
    }

    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }


  submit(form: FormGroup, formId) {
    // if (form.valid) {
    this.sendForm(form.getRawValue(), formId);
    // } else {
    //   this.errorForm();
    // }
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


  // uploader

  onFileChange(event, small, el) {
    if (event.target.files && event.target.files.length) {
      this.uploadMultipleFiles(event.target.files, small, el);
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
              el.setValue(url);
              this.image = url;
            }
            this.sending = false;
          });
        })
      )
      .subscribe();
  }

  cleanFiles(small: HTMLElement, el: AbstractControl, e?: any) {
    e?.preventDefault();
    e?.stopPropagation();
    small.innerText = '';
    el?.setValue('');
  }

  uploadMultipleFiles(fileList: FileList, small: HTMLElement, el: FormControl) {
    this.sending = true;
    const initialSmall = small.innerText.split(', ') || [];
    small.innerText = 'Carregando...';
    const downloadUrls$ = _.map(fileList, (file, key) => {
      const n = Date.now();
      const filePath = `${this.path}/${n}-${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);
      return task.snapshotChanges().pipe(
        filter((uploadTask) => {
          return uploadTask.state === 'success';
        }),
        switchMap(() => {
          return from(fileRef.getDownloadURL());
        })
      );
    });

    Observable.forkJoin(...downloadUrls$)
      .subscribe((urls) => {
        small.innerText = _.join([..._.map(fileList, value => value.name), ...initialSmall], ', ');
        const initalValues = el.value || [];
        el.setValue([...initalValues, ...urls]);
      });
  }


  private setupCorretores(): void {
    this.corretores = this.wpService.corretores;

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
        console.log(value);
        this.successForm();
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
