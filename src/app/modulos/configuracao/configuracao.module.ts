import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KubernetesModule, TceNgLibModule } from 'tce-ng-lib';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ConfiguracaoRoutingModule } from './configuracao-routing.module';
import { MatStepperModule } from '@angular/material/stepper';
import { ConfiguracaoConexaoBancoFormComponent } from './configuracao-conexao-banco-form/configuracao-conexao-banco-form.component';
import { ConfiguracaoConexaoBancoListComponent } from './configuracao-conexao-banco-list/configuracao-conexao-banco-list.component';
import { ConfiguracaoCaminhosListComponent } from './configuracao-caminhos-list/configuracao-caminhos-list.component';
import { ConfiguracaoCaminhosFormComponent } from './configuracao-caminhos-form/configuracao-caminhos-form.component';

@NgModule({
  declarations: [ConfiguracaoConexaoBancoFormComponent, ConfiguracaoConexaoBancoListComponent, ConfiguracaoCaminhosListComponent, ConfiguracaoCaminhosFormComponent],
  imports: [
    CommonModule,
    KubernetesModule,
    ConfiguracaoRoutingModule,
    TceNgLibModule.forRoot((window as any).configuration),
    TooltipModule,
    MatSlideToggleModule,
    MatStepperModule,
  ],
})
export class ConfiguracaoModule {}
