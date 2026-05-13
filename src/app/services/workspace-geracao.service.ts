import { Injectable, Injector } from '@angular/core';
import { BaseService, ConfigService } from 'tce-ng-lib';
import { WorkspaceGeracaoType } from '../models/WorkspaceGeracaoType';

@Injectable({
  providedIn: 'root',
})
export class WokspaceGeracaoService extends BaseService<WorkspaceGeracaoType> {
  constructor(injector: Injector) {
    super(injector, `${ConfigService.getEnv().apiSistema}/WorkspaceGeracao`);
  }
}
