import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KubernetesModule, TceNgLibModule } from 'tce-ng-lib';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ConfiguracaoRoutingModule } from './configuracao-routing.module';
import { MatStepperModule } from '@angular/material/stepper';
import { ConfiguracaoFormComponent } from './configuracao-form/configuracao-form.component';
import { ConfiguracaoListComponent } from './configuracao-list/configuracao-list.component';

@NgModule({
  declarations: [ConfiguracaoFormComponent, ConfiguracaoListComponent],
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
