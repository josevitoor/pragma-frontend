import { Injectable, Injector } from '@angular/core';
import { BaseService, ConfigService } from 'tce-ng-lib';
import { ConfiguracaoConexaoBancoType } from '../models/ConfiguracaoConexaoBancoType';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoConexaoBancoService extends BaseService<ConfiguracaoConexaoBancoType> {
  constructor(injector: Injector) {
    super(injector, `${ConfigService.getEnv().apiSistema}/ConfiguracaoConexaoBanco`);
  }
}
