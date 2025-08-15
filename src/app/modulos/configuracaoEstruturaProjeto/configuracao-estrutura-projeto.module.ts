import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KubernetesModule, TceNgLibModule } from 'tce-ng-lib';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ConfiguracaoEstruturaProjetoRoutingModule } from './configuracao-estrutura-projeto-routing.module';
import { ConfiguracaoEstruturaProjetoListComponent } from './configuracao-estrutura-projeto-list/configuracao-estrutura-projeto-list.component';
import { ConfiguracaoEstruturaProjetoFormComponent } from './configuracao-estrutura-projeto-form/configuracao-estrutura-projeto-form.component';

@NgModule({
  declarations: [
    ConfiguracaoEstruturaProjetoListComponent,
    ConfiguracaoEstruturaProjetoFormComponent
  ],
  imports: [
    CommonModule,
    KubernetesModule,
    ConfiguracaoEstruturaProjetoRoutingModule,
    TceNgLibModule.forRoot((window as any).configuration),
    TooltipModule
  ],
})
export class ConfiguracaoEstruturaProjetoModule {}