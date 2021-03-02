import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

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

  constructor(private location: Location, private modalService: NgbModal) {
  }

  ngOnInit() {
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


}
