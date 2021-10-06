import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {ImoveisComponent} from './imoveis/imoveis.component';
import {HomeComponent} from './home/home.component';
import {RouterModule} from '@angular/router';
import {ROUTES} from './app.routes';
import {FooterComponent} from './footer/footer.component';
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {OwlModule} from 'ngx-owl-carousel';
import {ImovelComponent} from './imovel/imovel.component';
import {QueroNegociarComponent} from './quero-negociar/quero-negociar.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSliderModule} from '@angular/material/slider'
import {Ng5SliderModule} from 'ng5-slider';
import {WPService} from './core/services/w-p.service';
import {SobreComponent} from './sobre/sobre.component';
import {LeadService} from './core/services/lead.service';
import {ToastrModule} from 'ngx-toastr';
import {ComponentFixtureAutoDetect} from '@angular/core/testing';
import {NgxUiLoaderConfig, NgxUiLoaderModule} from 'ngx-ui-loader';
import {registerLocaleData} from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {environment} from "../environments/environment";
import {AllImoveis} from "./core/services/all-imoveis.service";
import {FabComponent} from './fab/fab.component';
import {CustomSearchComponent} from './custom-search/custom-search.component';
import {MomentModule} from 'ngx-moment';
import {NgImageSliderModule} from "ng-image-slider";
import {LancamentoComponent} from "./imoveis/lancamento/lancamento.component";
import {CarouselModule} from "ngx-owl-carousel-o";
import {NgBrazil} from "ng-brazil";
import {TextMaskModule} from "angular2-text-mask";
import {BlogComponent} from './blog/blog.component';
import {BlogDetailComponent} from './blog/blog-detail/blog-detail.component';
import {ServicosFormulariosComponent} from './servicos-formularios/servicos-formularios.component';
import {FormPessoaFisicaComponent} from './servicos-formularios/form-pessoa-fisica/form-pessoa-fisica.component';
import {LancamentosComponent} from './imoveis/lancamentos/lancamentos.component';
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {getFirestore, provideFirestore} from "@angular/fire/firestore";
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFirestoreModule} from "@angular/fire/compat/firestore";
import {GoogleMapsModule} from "@angular/google-maps";
import { NextToastComponent } from './core/components/next-toast/next-toast.component';

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
    CustomSearchComponent,
    LancamentoComponent,
    BlogComponent,
    BlogDetailComponent,
    ServicosFormulariosComponent,
    FormPessoaFisicaComponent,
    LancamentosComponent,
    NextToastComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    OwlModule,
    NgbModule,
    FormsModule,
    MomentModule,
    ReactiveFormsModule,
    Ng5SliderModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    MatSliderModule,
    CarouselModule,
    NgBrazil,
    TextMaskModule,
    NgImageSliderModule,
    ToastrModule.forRoot(),
    RouterModule.forRoot(ROUTES, {relativeLinkResolution: 'legacy'}),
    FormsModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    TextMaskModule,
    NgBrazil,
    GoogleMapsModule
  ],
  providers: [
    LeadService,
    WPService,
    AllImoveis,
    {provide: LOCALE_ID, useValue: 'pt-BR'},
    {provide: ComponentFixtureAutoDetect, useValue: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
