import { Component, OnInit } from '@angular/core';
import {WPService} from "../../core/services/w-p.service";

@Component({
  selector: 'app-lancamentos',
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.css']
})
export class LancamentosComponent implements OnInit {

  lancamentos:any[] = [];

  constructor(private lancamentoService: WPService) {

  }

  ngOnInit() {

    this.lancamentoService.all().subscribe(value => {
      this.lancamentos = value.body;
      try {
        window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
      } catch (e) {
        window.scrollTo(0, 0);
      }

    });
  }

}
