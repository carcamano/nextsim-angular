import {Component, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.component.html',
  styleUrls: ['./sobre.component.css']
})
export class SobreComponent implements OnInit {

  latitude = -22.902578;
  longitude = -47.041508;

  constructor() { }

  ngOnInit() {
  }

}
