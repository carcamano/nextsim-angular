import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {ImoveisComponent} from './imoveis/imoveis.component';
import {HomeComponent} from './home/home.component';
import {RouterModule} from '@angular/router';
import {ROUTES} from './app.routes';
import {FooterComponent} from './footer/footer.component';
import {ImoveisService} from './imoveis/imoveis.service';
import {HttpClientModule} from '@angular/common/http';
import {OwlModule} from 'ngx-owl-carousel';
import {ImovelComponent} from './imovel/imovel.component';
import {AgmCoreModule} from '@agm/core';
import {QueroNegociarComponent} from './quero-negociar/quero-negociar.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ImoveisComponent,
    HomeComponent,
    FooterComponent,
    ImovelComponent,
    QueroNegociarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    OwlModule,
    NgbModule,
    FontAwesomeModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB8F9P_r8OgBfXItSsOAGNB5LnIHWw-Jbw'
    }),
    RouterModule.forRoot(ROUTES),
    FormsModule
  ],
  providers: [
    ImoveisService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
