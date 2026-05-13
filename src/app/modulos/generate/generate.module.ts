import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KubernetesModule, TceNgLibModule } from 'tce-ng-lib';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GenerateRoutingModule } from './generate-routing.module';
import { GenerateFormComponent } from './generate-form/generate-form.component';
import { MatStepperModule } from '@angular/material/stepper';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ModelagemErFormComponent } from './modalgem-er-form/modelagem-er-form.component';
import { ModelagemSqlFormComponent } from './modalgem-sql/modelagem-sql-form.component';
import { WorkspaceModalComponent } from './workspace-modal/workspace-modal.component';

@NgModule({
  declarations: [GenerateFormComponent, ModelagemErFormComponent, ModelagemSqlFormComponent, WorkspaceModalComponent],
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
