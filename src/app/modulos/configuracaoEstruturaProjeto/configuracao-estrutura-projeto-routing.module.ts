import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfiguracaoEstruturaProjetoListComponent } from './configuracao-estrutura-projeto-list/configuracao-estrutura-projeto-list.component';
import { ConfiguracaoEstruturaProjetoFormComponent } from './configuracao-estrutura-projeto-form/configuracao-estrutura-projeto-form.component';

const routes: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Gerenciar Configuracao Estrutura Projeto' },
    children: [
      {
        path: '',
        component: ConfiguracaoEstruturaProjetoListComponent,
      },
      {
        path: 'new',
        component: ConfiguracaoEstruturaProjetoFormComponent,
        data: { breadcrumb: 'Cadastrar Configuracao Estrutura Projeto' },
      },
      {
        path: ':id/edit',
        component: ConfiguracaoEstruturaProjetoFormComponent,
        data: { breadcrumb: 'Editar Configuracao Estrutura Projeto' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracaoEstruturaProjetoRoutingModule {}