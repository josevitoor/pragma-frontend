import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { InicioComponent } from './inicio/inicio.component';
import {
  HashLocationStrategy,
  LocationStrategy,
  registerLocaleData,
} from '@angular/common';
import br from '@angular/common/locales/br';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing/app.routing.module';
import { KubernetesModule, TceNgLibModule } from 'tce-ng-lib';
import { GenerateModule } from './modulos/generate/generate.module';
import { ConfiguracaoModule } from './modulos/configuracao/configuracao.module';

registerLocaleData(br, 'pt-BR');

@NgModule({
  declarations: [AppComponent, InicioComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    KubernetesModule,
    TceNgLibModule.forRoot((window as any).configuration),
    GenerateModule,
    ConfiguracaoModule,
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
