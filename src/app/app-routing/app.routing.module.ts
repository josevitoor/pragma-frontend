import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AuthGuard,
  DashboardComponent,
  MeuPerfilComponent,
  PageNotFoundComponent,
} from 'tce-ng-lib';
import { InicioComponent } from '../inicio/inicio.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: InicioComponent },
      {
        path: 'meuperfil',
        children: [
          {
            path: ':id/edit',
            component: MeuPerfilComponent,
            data: { breadcrumb: 'Editar Perfil' },
          },
        ],
      },
      {
        path: 'gerador',
        loadChildren: () =>
          import('../modulos/generate/generate.module').then(
            (a) => a.GenerateModule
          ),
      },
      { path: '404', component: PageNotFoundComponent },
      { path: '**', redirectTo: '404' },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
