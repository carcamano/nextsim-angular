import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-next-toast',
  templateUrl: './next-toast.component.html',
  styleUrls: ['./next-toast.component.scss']
})
export class NextToastComponent implements OnInit {

  @Input() title: string;
  @Input() text: string;

  @Input() set show(value) {
    this.valueShow = value;
    this.showHide()
  }

  get show() {
    return this.valueShow;
  }

  private valueShow = false;

  constructor() { }

  ngOnInit(): void {
  }

  showHide() {
    if(this.valueShow) {

    } else {

    }
  }


  close() {

  }

}
