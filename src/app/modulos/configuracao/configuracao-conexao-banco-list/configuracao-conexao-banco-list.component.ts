import { Component, Injector, OnInit } from '@angular/core';
import { ConfiguracaoConexaoBancoType } from 'src/app/models/ConfiguracaoConexaoBancoType';
import { ConfiguracaoConexaoBancoService } from 'src/app/services/configuracao-conexao-banco.service';
import { BaseResourceListComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-configuracao-conexao-banco-list',
  templateUrl: './configuracao-conexao-banco-list.component.html',
})
export class ConfiguracaoConexaoBancoListComponent
  extends BaseResourceListComponent<ConfiguracaoConexaoBancoType>
  implements OnInit
{
  service: ConfiguracaoConexaoBancoService;

  constructor(protected injector: Injector) {
    super(new ConfiguracaoConexaoBancoService(injector));
    this.service = injector.get(ConfiguracaoConexaoBancoService);
    this.inicializarVazio = true;

    this.searchTermFields = {
      servidor: true,
      baseDados: true,
      porta: true,
    };
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.allResources = await this.service
      .getAllWithPathAdicional('operador')
      .then();
  }

  /**
   * Deleta recurso por id
   */
  async deleteItem(id: number) {
    const { value } = await this.modalService.confirm(
      'Tem certeza que deseja excluir essa configuração de conexão? essa ação não poderá ser desfeita.',
      ''
    );

    if (!value) return;

    try {
      await this.baseService.delete(id);

      this.allResources = this.resources.filter(
        (resource) => resource['idConfiguracaoConexaoBanco'] !== id
      );
    } catch (error) {
      this.globalMessageService.errorMessages.next([
        error?.error?.Erros[0] ?? `Erro ao excluir a configuração de conexão`,
      ]);
    }
  }
}
