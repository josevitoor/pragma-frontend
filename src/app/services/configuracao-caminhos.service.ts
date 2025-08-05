import { Injectable, Injector } from '@angular/core';
import { ConfiguracaoCaminhosType } from '../models/ConfiguracaoCaminhosType';
import { BaseService, ConfigService } from 'tce-ng-lib';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoCaminhosService extends BaseService<ConfiguracaoCaminhosType> {
  constructor(injector: Injector) {
    super(injector, `${ConfigService.getEnv().apiSistema}/ConfiguracaoCaminhos`);
  }
}