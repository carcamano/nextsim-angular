import {Component, OnInit} from '@angular/core';
import {IsotopeOptions} from 'ngx-isotopee';
import {LancamentoService} from './lancamento.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  myOptions: IsotopeOptions = {
    itemSelector: '.grid-item'
  };

  lancamentos:any[] = []
  constructor(private lancamentoService: LancamentoService) {
  }

  ngOnInit() {

    this.lancamentoService.all().subscribe(value => {
      console.log(value.body);
      this.lancamentos = value.body;
      if (this.lancamentos.length > 6) {
        this.lancamentos = this.lancamentos.slice(0, 5);
      }

    });


  }

}
