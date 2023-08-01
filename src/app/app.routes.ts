import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {ImoveisComponent} from './imoveis/imoveis.component';
import {ImovelComponent} from './imovel/imovel.component';
import {SobreComponent} from './sobre/sobre.component';
import {QueroNegociarComponent} from './quero-negociar/quero-negociar.component';
import {LancamentoComponent} from './imoveis/lancamento/lancamento.component';
import {BlogComponent} from './blog/blog.component';
import {BlogDetailComponent} from './blog/blog-detail/blog-detail.component';
import {ServicosFormulariosComponent} from './servicos-formularios/servicos-formularios.component';
import {LancamentosComponent} from './imoveis/lancamentos/lancamentos.component';
import {LeaveGuardService} from './core/services/leave-guard.service';
import {PoliticaComponent} from './politica/politica.component';

export const ROUTES: Routes = [
  {path: '', component: HomeComponent},
  {path: 'blog', component: BlogComponent},
  {path: 'blog/:post', component: BlogDetailComponent},
  {path: 'sobre-nos', component: SobreComponent},
  {path: 'quero-negociar', component: QueroNegociarComponent},
  {path: 'politica-de-cookies', component: PoliticaComponent},
  {path: 'servicos', component: ServicosFormulariosComponent},
  {path: 'imoveis',
    canActivateChild: [LeaveGuardService],
    children: [
      {
        path: '',
        component: ImoveisComponent
      },
      {
        path: 'lancamentos',
        component: LancamentosComponent
      },
      {
        path: 'lancamentos/:slug',
        component: LancamentoComponent
      },
      {
        path: 'para-construir',
        component: ImoveisComponent,
        data: {finalidade: 'residencial', categoria: 'comprar', tipos: 'terreno', breadcrumbTitle: 'Para construir'}
      },
      {
        path: 'destaques',
        component: ImoveisComponent,
        data: {destaques: true, breadcrumbTitle: 'Destaques'}
      },
      {
        path: 'para-familia',
        component: ImoveisComponent,
        data: {finalidade: 'residencial', dormitorios: '3', breadcrumbTitle: 'Para família'}
      },
      {
        path: 'para-casal',
        component: ImoveisComponent,
        data: {finalidade: 'residencial', dormitorios: '2', breadcrumbTitle: 'Para casal'}
      },
      {
        path: 'morando-sozinho',
        component: ImoveisComponent,
        data: {finalidade: 'residencial', dormitorios: '1', breadcrumbTitle: 'Morando sozinho'}
      },

      {
        path: ':id',
        component: ImovelComponent
      },
    ]},
  {path: 'servicos', component: ServicosFormulariosComponent},
];
