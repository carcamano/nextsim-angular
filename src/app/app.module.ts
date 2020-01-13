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
import {Ng5SliderModule} from 'ng5-slider';
import {LOCALE_ID} from '@angular/core';
import {IsotopeModule} from 'ngx-isotopee';
import {LancamentoService} from './home/lancamento.service';
import {SobreComponent} from './sobre/sobre.component';
import {ImovelService} from './imovel/imovel.service';
import {ToastrModule} from 'ngx-toastr';
import {ComponentFixtureAutoDetect} from '@angular/core/testing';
import {NgxUiLoaderConfig, NgxUiLoaderModule, NgxUiLoaderRouterModule} from 'ngx-ui-loader';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {AngularFireModule} from "@angular/fire";
import {environment} from "../environments/environment";
import {AngularFireDatabaseModule} from "@angular/fire/database";
import {AllImoveis} from "./all-imoveis.service";
import { FabComponent } from './fab/fab.component';
import { CustomSearchComponent } from './custom-search/custom-search.component';
registerLocaleData(localePt);

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: '#f69731',
  bgsOpacity: 0.5,
  bgsPosition: 'bottom-right',
  bgsSize: 60,
  bgsType: 'ball-spin-clockwise',
  blur: 5,
  fgsColor: '#f69731',
  fgsPosition: 'center-center',
  fgsSize: 60,
  fgsType: 'double-bounce',
  gap: 24,
  logoPosition: 'center-center',
  logoSize: 120,
  logoUrl: '',
  masterLoaderId: 'master',
  overlayBorderRadius: '0',
  overlayColor: 'rgba(40,40,40,0.69)',
  pbColor: 'red',
  pbDirection: 'ltr',
  pbThickness: 3,
  hasProgressBar: false,
  text: '',
  textColor: '#FFFFFF',
  textPosition: 'center-center',
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ImoveisComponent,
    HomeComponent,
    FooterComponent,
    ImovelComponent,
    QueroNegociarComponent,
    SobreComponent,
    FabComponent,
    CustomSearchComponent
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
    ToastrModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB8F9P_r8OgBfXItSsOAGNB5LnIHWw-Jbw'
    }),
    RouterModule.forRoot(ROUTES),
    FormsModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule
  ],
  providers: [
    ImoveisService,
    ImovelService,
    GeneralService,
    LancamentoService,
    AllImoveis,
    {provide: LOCALE_ID, useValue: 'pt-BR'},
    {provide: ComponentFixtureAutoDetect, useValue: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
