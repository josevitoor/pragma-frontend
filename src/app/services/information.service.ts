import { Injectable, Injector } from '@angular/core';
import { BaseService, ConfigService } from 'tce-ng-lib';
import { InformationType } from '../models/InformationType';
import { ConnectionFilterType } from '../models/ConnectionFilterType';
import { HttpParams } from '@angular/common/http';

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
  async getTableNames(): Promise<string[]> {
    return this.http.get<string[]>(`${this.BASE_URL}/table-name`).toPromise();
  }

  /**
   * Retorna todos os campos de uma tabela
   */
  async getTableColumns(tableName: string): Promise<InformationType[]> {
    return this.http
      .get<InformationType[]>(`${this.BASE_URL}/${tableName}`)
      .toPromise();
  }

  /**
   * Retorna as informações de todas tabelas com base na conexão de banco de dados passada
   */
  async getAllInformations(
    connectionFilter: ConnectionFilterType
  ): Promise<InformationType[]> {
    const params = new HttpParams()
      .set('host', connectionFilter.host)
      .set('port', connectionFilter.port.toString())
      .set('user', connectionFilter.user)
      .set('password', connectionFilter.password)
      .set('database', connectionFilter.database);

    return this.http
      .get<InformationType[]>(`${this.BASE_URL}`, { params })
      .toPromise();
  }
}
