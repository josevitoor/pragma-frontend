import { Injectable, Injector } from '@angular/core';
import { ConfiguracaoEstruturaProjetoType } from '../models/ConfiguracaoEstruturaProjetoType';
import { BaseService, ConfigService } from 'tce-ng-lib';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoEstruturaProjetoService extends BaseService<ConfiguracaoEstruturaProjetoType> {
  constructor(injector: Injector) {
    super(injector, `${ConfigService.getEnv().apiSistema}/ConfiguracaoEstruturaProjeto`);
  }
}