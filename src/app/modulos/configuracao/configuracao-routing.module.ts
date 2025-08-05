import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfiguracaoConexaoBancoListComponent } from './configuracao-conexao-banco-list/configuracao-conexao-banco-list.component';
import { ConfiguracaoConexaoBancoFormComponent } from './configuracao-conexao-banco-form/configuracao-conexao-banco-form.component';
import { ConfiguracaoCaminhosListComponent } from './configuracao-caminhos-list/configuracao-caminhos-list.component';
import { ConfiguracaoCaminhosFormComponent } from './configuracao-caminhos-form/configuracao-caminhos-form.component';

const routes: Routes = [
  {
    path: 'conexao-banco-dados',
    data: { breadcrumb: 'Configuração de Conexão do Banco de Dados' },
    children: [
      {
        path: '',
        component: ConfiguracaoConexaoBancoListComponent,
        data: { breadcrumb: '' },
      },
      {
        path: 'new',
        component: ConfiguracaoConexaoBancoFormComponent,
        data: { breadcrumb: 'Cadastrar configuração' },
      },
      {
        path: ':id/edit',
        component: ConfiguracaoConexaoBancoFormComponent,
        data: { breadcrumb: 'Editar configuração' },
      },
    ],
  },
  {
    path: 'caminho-projeto',
    data: { breadcrumb: 'Configuração de Caminho do Projeto' },
    children: [
      {
        path: '',
        component: ConfiguracaoCaminhosListComponent,
        data: { breadcrumb: '' },
      },
      {
        path: 'new',
        component: ConfiguracaoCaminhosFormComponent,
        data: { breadcrumb: 'Cadastrar configuração' },
      },
      {
        path: ':id/edit',
        component: ConfiguracaoCaminhosFormComponent,
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
