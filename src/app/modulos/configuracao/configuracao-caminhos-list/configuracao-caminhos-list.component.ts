import { Component, Injector } from '@angular/core';
import { ConfiguracaoCaminhosType } from 'src/app/models/ConfiguracaoCaminhosType';
import { ConfiguracaoCaminhosService } from 'src/app/services/configuracao-caminhos.service';
import { AlertsService, BaseResourceListComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-configuracao-caminhos-list',
  templateUrl: './configuracao-caminhos-list.component.html',
})
export class ConfiguracaoCaminhosListComponent extends BaseResourceListComponent<ConfiguracaoCaminhosType> {
  service: ConfiguracaoCaminhosService;

  constructor(protected injector: Injector, private alert: AlertsService) {
    super(new ConfiguracaoCaminhosService(injector));
    this.service = injector.get(ConfiguracaoCaminhosService);

    this.inicializarVazio = true;

    this.searchTermFields = {
      caminhoCliente: true,
      caminhoApi: true,
      dataInclusao: true,
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
      'Tem certeza que deseja excluir essa configuração de caminho? essa ação não poderá ser desfeita.',
      ''
    );

    if (!value) return;

    try {
      await this.baseService.delete(id);

      this.allResources = this.resources.filter(
        (resource) => resource['idConfiguracaoCaminho'] !== id
      );
    } catch (error) {
      this.alert.error(
        'Erro!',
        error?.error?.Erros[0] ?? `Erro ao excluir a configuração de caminho`
      );
    }
  }
}
