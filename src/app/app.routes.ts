import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {ImoveisComponent} from './imoveis/imoveis.component';
import {ImovelComponent} from './imovel/imovel.component';
import {SobreComponent} from './sobre/sobre.component';
import {QueroNegociarComponent} from './quero-negociar/quero-negociar.component';

export const ROUTES: Routes = [
  {path: '', component: HomeComponent},
  {path: 'sobre-nos', component: SobreComponent},
  {path: 'quero-negociar', component: QueroNegociarComponent},
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
];