import { Injectable, Injector } from '@angular/core';
import { BaseService, ConfigService } from 'tce-ng-lib';
import { GenerateFilterType } from '../models/GenerateFilterType';

@Injectable({
  providedIn: 'root',
})
export class GenerateService extends BaseService<GenerateFilterType> {
  private readonly BASE_URL = `${ConfigService.getEnv().apiSistema}/Generate`;

  constructor(injector: Injector) {
    super(injector, `${ConfigService.getEnv().apiSistema}/Generate`);
  }

  /**
   * Gera os arquivos de código CRUD
   */
  generateCrudFiles(generateFilter: GenerateFilterType): Promise<void> {
    return this.http
      .post<void>(`${this.BASE_URL}/generate-files`, generateFilter)
      .toPromise();
  }

  /**
   * Validar caminho para geração dos arquivos
   */
  validateStructure(
    pathApi: string,
    pathClient: string,
    routerPath: string
  ): Promise<void> {
    return this.http
      .get<void>(
        `${this.BASE_URL}/validate-structure?projectApiRootPath=${pathApi}&projectClientRootPath=${pathClient}&routerFilePath=${routerPath}`
      )
      .toPromise();
  }
}
