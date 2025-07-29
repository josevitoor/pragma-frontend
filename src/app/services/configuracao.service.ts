import { Injectable, Injector } from '@angular/core';
import { BaseService, ConfigService } from 'tce-ng-lib';
import { ConfiguracaoGeracaoType } from '../models/ConfiguracaoType';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoGeracaoService extends BaseService<ConfiguracaoGeracaoType> {
  constructor(injector: Injector) {
    super(injector, `${ConfigService.getEnv().apiSistema}/ConfiguracaoGeracao`);
  }
}
