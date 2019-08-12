import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {ImoveisComponent} from './imoveis/imoveis.component';

export const ROUTES: Routes = [
  {path: '', component: HomeComponent},
  {path: 'imoveis', component: ImoveisComponent}
]
