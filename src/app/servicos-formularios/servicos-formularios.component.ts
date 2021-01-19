import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-servicos-formularios',
  templateUrl: './servicos-formularios.component.html',
  styleUrls: ['./servicos-formularios.component.scss']
})
export class ServicosFormulariosComponent implements OnInit {


  constructor(
    private location: Location,
  ) { }

  ngOnInit() {
  }

  mToggle(event) {

  }


  goBack() {
    this.location.back();
  }


}
