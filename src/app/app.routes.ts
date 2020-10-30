import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {ImoveisComponent} from './imoveis/imoveis.component';
import {ImovelComponent} from './imovel/imovel.component';
import {SobreComponent} from './sobre/sobre.component';
import {QueroNegociarComponent} from './quero-negociar/quero-negociar.component';
import {LancamentoComponent} from "./imoveis/lancamento/lancamento.component";
import {BlogComponent} from "./blog/blog.component";
import {BlogDetailComponent} from "./blog/blog-detail/blog-detail.component";
import { ServicosFormulariosComponent } from './servicos-formularios/servicos-formularios.component';

export const ROUTES: Routes = [
  {path: '', component: HomeComponent},
  {path: 'blog', component: BlogComponent},
  {path: 'blog/:post', component: BlogDetailComponent},
  {path: 'sobre-nos', component: SobreComponent},
  {path: 'quero-negociar', component: QueroNegociarComponent},
  {path: 'servicos', component: ServicosFormulariosComponent},
  {path: 'imoveis',
    children: [
      {
        path: '',
        component: ImoveisComponent
      },
      {
        path: ':id',
        component: ImovelComponent
      },
      {
        path: 'lancamentos/:slug',
        component: LancamentoComponent
      }
    ]}
];
