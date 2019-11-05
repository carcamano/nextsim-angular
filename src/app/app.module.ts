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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GeneralService} from './imoveis/general.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSliderModule} from '@angular/material';
import { Ng5SliderModule } from 'ng5-slider';
import { LOCALE_ID } from '@angular/core';
import {IsotopeModule} from 'ngx-isotopee';
import {LancamentoService} from './home/lancamento.service';
import { SobreComponent } from './sobre/sobre.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ImoveisComponent,
    HomeComponent,
    FooterComponent,
    ImovelComponent,
    QueroNegociarComponent,
    SobreComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    OwlModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    IsotopeModule,
    Ng5SliderModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    MatSliderModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB8F9P_r8OgBfXItSsOAGNB5LnIHWw-Jbw'
    }),
    RouterModule.forRoot(ROUTES),
    FormsModule
  ],
  providers: [
    ImoveisService,
    GeneralService,
    LancamentoService,
    {provide: LOCALE_ID, useValue: 'pt-BR'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
