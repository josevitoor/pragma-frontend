/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard, DashboardComponent, MeuPerfilComponent } from 'tce-ng-lib';
import { InicioComponent } from '../inicio/inicio.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes =
  [
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
              data: { breadcrumb: 'Editar Perfil' }
            }
          ]
        },
      ]
    }
  ];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }