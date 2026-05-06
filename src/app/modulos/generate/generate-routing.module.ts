import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GenerateFormComponent } from './generate-form/generate-form.component';
import { ModelagemErFormComponent } from './modalgem-er-form/modelagem-er-form.component';
import { ModelagemSqlFormComponent } from './modalgem-sql/modelagem-sql-form.component';

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
    path: 'modelagem-relacional',
    data: { breadcrumb: 'Modelagem Relacional' },
    children: [
      {
        path: '',
        component: ModelagemErFormComponent,
        data: { breadcrumb: '' },
      },
    ],
  },
  {
    path: 'modelagem-sql',
    data: { breadcrumb: 'Modelagem Sql' },
    children: [
      {
        path: '',
        component: ModelagemSqlFormComponent,
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
