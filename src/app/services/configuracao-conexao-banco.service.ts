import { Injectable, Injector } from '@angular/core';
import { BaseService, ConfigService } from 'tce-ng-lib';
import { ConfiguracaoConexaoBancoType } from '../models/ConfiguracaoConexaoBancoType';
import { ConnectionFilterType } from '../models/ConnectionFilterType';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoConexaoBancoService extends BaseService<ConfiguracaoConexaoBancoType> {
  private readonly BASE_URL = `${
    ConfigService.getEnv().apiSistema
  }/ConfiguracaoConexaoBanco`;

  constructor(injector: Injector) {
    super(
      injector,
      `${ConfigService.getEnv().apiSistema}/ConfiguracaoConexaoBanco`
    );
  }

  /**
   * Valida conexão do banco de dados
   */
  async validateConnection(
    connectionFilter: ConnectionFilterType
  ): Promise<void> {
    const params = new HttpParams()
      .set('servidor', connectionFilter.servidor)
      .set('porta', connectionFilter.porta.toString())
      .set('usuario', connectionFilter.usuario)
      .set('senha', connectionFilter.senha)
      .set('baseDados', connectionFilter.baseDados);

    return this.http
      .get<void>(`${this.BASE_URL}/validate-connection`, { params })
      .toPromise();
  }
}
