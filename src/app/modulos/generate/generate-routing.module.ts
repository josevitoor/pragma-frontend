import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GenerateFormComponent } from './generate-form/generate-form.component';

const routes: Routes = [
  {
    path: 'gerar-codigo',
    data: { breadcrumb: 'Geração Automatizada de código CRUD' },
    children: [
      {
        path: '',
        component: GenerateFormComponent,
        data: { breadcrumb: '' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenerateRoutingModule {}
