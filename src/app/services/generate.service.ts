import { Injectable, Injector } from '@angular/core';
import { BaseService, ConfigService } from 'tce-ng-lib';
import { GenerateFilterType } from '../models/GenerateFilterType';
import { GenerateSqlRequest } from '../models/GenerateSqlType';

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
   * Gera o script SQL para criação do banco de dados
   */
  generateSql(generateSql: GenerateSqlRequest): Promise<void> {
    return this.http
      .post<void>(`${this.BASE_URL}/generate-sql`, generateSql)
      .toPromise();
  }
}
