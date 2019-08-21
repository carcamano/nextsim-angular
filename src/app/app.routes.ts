import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {ImoveisComponent} from './imoveis/imoveis.component';
import {ImovelComponent} from './imovel/imovel.component';

export const ROUTES: Routes = [
  {path: '', component: HomeComponent},
  {path: 'imoveis',
    children: [
      {
        path: '',
        component: ImoveisComponent
      },
      {
        path: ':id',
        component: ImovelComponent
      }
    ]}
]
