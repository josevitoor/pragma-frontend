import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KubernetesModule, TceNgLibModule } from 'tce-ng-lib';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GenerateRoutingModule } from './generate-routing.module';
import { GenerateFormComponent } from './generate-form/generate-form.component';
import { MatStepperModule } from '@angular/material/stepper';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [GenerateFormComponent],
  imports: [
    CommonModule,
    KubernetesModule,
    GenerateRoutingModule,
    TceNgLibModule.forRoot((window as any).configuration),
    TooltipModule,
    MatSlideToggleModule,
    MatStepperModule,
    ModalModule.forRoot(),
  ],
})
export class GenerateModule {}
