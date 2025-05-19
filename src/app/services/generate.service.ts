import { Injectable, Injector } from '@angular/core';
import { BaseService, ConfigService } from 'tce-ng-lib';
import { GenerateBackendFilterType } from '../models/GenerateBackendFilterType';

@Injectable({
  providedIn: 'root',
})
export class GenerateService extends BaseService<GenerateBackendFilterType> {
  private readonly BASE_URL = `${ConfigService.getEnv().apiSistema}/Generate`;

  constructor(injector: Injector) {
    super(injector, `${ConfigService.getEnv().apiSistema}/Generate`);
  }

  /**
   * Gera os arquivos de código CRUD do backend
   */
  generateCrudFiles(backendFilter: GenerateBackendFilterType): Promise<void> {
    return this.http
      .post<void>(`${this.BASE_URL}/backend-files`, backendFilter)
      .toPromise();
  }

  /**
   * Validar caminho para geração dos arquivos
   */
  validateStructure(pathApi: string): Promise<void> {
    return this.http
      .get<void>(
        `${this.BASE_URL}/validate-structure?projectRootPath=${pathApi}`
      )
      .toPromise();
  }
}
