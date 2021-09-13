import {Component, OnInit, ViewChild} from '@angular/core';
import {WPService} from "../core/services/w-p.service";

@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.component.html',
  styleUrls: ['./sobre.component.css']
})
export class SobreComponent implements OnInit {

  latitude = -22.902578;
  longitude = -47.041508;

  historias: Historia[] = [];

  constructor(private lancamentoService: WPService) { }

  ngOnInit() {

    try {
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }

    this.lancamentoService.sobreNos().subscribe(value => {
      this.historias = value[0].acf.historia;
    });


  }

}

export interface Historia {
  data: string;
  texto: string;
}
