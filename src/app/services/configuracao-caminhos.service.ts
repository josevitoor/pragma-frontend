import { Injectable, Injector } from '@angular/core';
import { ConfiguracaoCaminhosType } from '../models/ConfiguracaoCaminhosType';
import { BaseService, ConfigService } from 'tce-ng-lib';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoCaminhosService extends BaseService<ConfiguracaoCaminhosType> {
  private readonly BASE_URL = `${
    ConfigService.getEnv().apiSistema
  }/ConfiguracaoCaminhos`;

  constructor(injector: Injector) {
    super(
      injector,
      `${ConfigService.getEnv().apiSistema}/ConfiguracaoCaminhos`
    );
  }

  /**
   * Validar caminho para geração dos arquivos
   */
  validateStructure(
    pathApi: string,
    pathClient: string,
    idEstruturaProjeto: string
  ): Promise<void> {
    return this.http
      .get<void>(
        `${this.BASE_URL}/validate-structure?projectApiRootPath=${pathApi}&projectClientRootPath=${pathClient}&idEstruturaProjeto=${idEstruturaProjeto}`
      )
      .toPromise();
  }
}
