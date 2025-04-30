import { Injectable, Injector } from '@angular/core';
import { BaseService, ConfigService } from 'tce-ng-lib';
import { InformationType } from '../models/InformationType';

@Injectable({
  providedIn: 'root',
})
export class InformationService extends BaseService<InformationType> {
  private readonly BASE_URL = `${
    ConfigService.getEnv().apiSistema
  }/Information`;

  constructor(injector: Injector) {
    super(injector, `${ConfigService.getEnv().apiSistema}/Information`);
  }

  /**
   * Retorna lista de nomes de tabelas disponíveis
   */
  getTableNames(): Promise<string[]> {
    return this.http.get<string[]>(`${this.BASE_URL}/table-name`).toPromise();
  }
}
