import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KubernetesModule, TceNgLibModule } from 'tce-ng-lib';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GenerateRoutingModule } from './generate-routing.module';

@NgModule({
  declarations: [],
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
