import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfiguracaoListComponent } from './configuracao-list/configuracao-list.component';
import { ConfiguracaoFormComponent } from './configuracao-form/configuracao-form.component';

const routes: Routes = [
  {
    path: 'geracao',
    data: { breadcrumb: 'Configuração' },
    children: [
      {
        path: '',
        component: ConfiguracaoListComponent,
        data: { breadcrumb: '' },
      },
      {
        path: 'new',
        component: ConfiguracaoFormComponent,
        data: { breadcrumb: 'Criar configuração' },
      },
      {
        path: ':id/edit',
        component: ConfiguracaoFormComponent,
        data: { breadcrumb: 'Editar configuração' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracaoRoutingModule {}
