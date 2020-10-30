import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-servicos-formularios',
  templateUrl: './servicos-formularios.component.html',
  styleUrls: ['./servicos-formularios.component.css']
})
export class ServicosFormulariosComponent implements OnInit {


  constructor(
    private location: Location,
  ) { }

  ngOnInit() {
  }


  goBack() {
    this.location.back();
  }

  
}
