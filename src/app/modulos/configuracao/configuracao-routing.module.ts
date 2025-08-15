import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfiguracaoConexaoBancoListComponent } from './configuracao-conexao-banco-list/configuracao-conexao-banco-list.component';
import { ConfiguracaoConexaoBancoFormComponent } from './configuracao-conexao-banco-form/configuracao-conexao-banco-form.component';
import { ConfiguracaoCaminhosListComponent } from './configuracao-caminhos-list/configuracao-caminhos-list.component';
import { ConfiguracaoCaminhosFormComponent } from './configuracao-caminhos-form/configuracao-caminhos-form.component';
import { ConfiguracaoEstruturaProjetoListComponent } from './configuracao-estrutura-projeto-list/configuracao-estrutura-projeto-list.component';
import { ConfiguracaoEstruturaProjetoFormComponent } from './configuracao-estrutura-projeto-form/configuracao-estrutura-projeto-form.component';

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
        data: { breadcrumb: 'Cadastrar Configuração' },
      },
      {
        path: ':id/edit',
        component: ConfiguracaoConexaoBancoFormComponent,
        data: { breadcrumb: 'Editar Configuração' },
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
        data: { breadcrumb: 'Cadastrar Configuração' },
      },
      {
        path: ':id/edit',
        component: ConfiguracaoCaminhosFormComponent,
        data: { breadcrumb: 'Editar Configuração' },
      },
    ],
  },
  {
    path: 'estrutura-projeto',
    data: { breadcrumb: 'Configuração de Estrutura do Projeto' },
    children: [
      {
        path: '',
        component: ConfiguracaoEstruturaProjetoListComponent,
        data: { breadcrumb: '' },
      },
      {
        path: 'new',
        component: ConfiguracaoEstruturaProjetoFormComponent,
        data: { breadcrumb: 'Cadastrar Configuração' },
      },
      {
        path: ':id/edit',
        component: ConfiguracaoEstruturaProjetoFormComponent,
        data: { breadcrumb: 'Editar Configuração' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracaoRoutingModule {}
