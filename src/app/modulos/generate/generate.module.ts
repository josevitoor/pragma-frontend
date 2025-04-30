import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KubernetesModule, TceNgLibModule } from 'tce-ng-lib';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GenerateRoutingModule } from './generate-routing.module';
import { GenerateFormComponent } from './generate-form/generate-form.component';

@NgModule({
  declarations: [GenerateFormComponent],
  imports: [
    CommonModule,
    KubernetesModule,
    GenerateRoutingModule,
    TceNgLibModule.forRoot((window as any).configuration),
    TooltipModule,
    MatSlideToggleModule,
  ],
})
export class GenerateModule {}
