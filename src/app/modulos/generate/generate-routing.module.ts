import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GenerateFormComponent } from './generate-form/generate-form.component';
import { ModelagemErFormComponent } from './modalgem-er-form/modelagem-er-form.component';

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
  {
    path: 'modelagem-er',
    data: { breadcrumb: 'Modelagem Entidade-Relacionamento' },
    children: [
      {
        path: '',
        component: ModelagemErFormComponent,
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
