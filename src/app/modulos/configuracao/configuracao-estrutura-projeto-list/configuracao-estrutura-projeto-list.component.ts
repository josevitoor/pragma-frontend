import { Component, Injector } from '@angular/core';
import { ConfiguracaoEstruturaProjetoType } from 'src/app/models/ConfiguracaoEstruturaProjetoType';
import { ConfiguracaoEstruturaProjetoService } from 'src/app/services/configuracao-estrutura-projeto.service';
import { BaseResourceListComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-configuracao-estrutura-projeto-list',
  templateUrl: './configuracao-estrutura-projeto-list.component.html',
})
export class ConfiguracaoEstruturaProjetoListComponent extends BaseResourceListComponent<ConfiguracaoEstruturaProjetoType> {
  service: ConfiguracaoEstruturaProjetoService;

  constructor(protected injector: Injector) {
    super(new ConfiguracaoEstruturaProjetoService(injector));
    this.service = injector.get(ConfiguracaoEstruturaProjetoService);

    this.searchTermFields = {
      nomeEstrutura: true,
      dataInclusao: true,
    };
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
  }

  /**
   * Deleta recurso por id
   */
  async deleteItem(id: number) {
    const { value } = await this.modalService.confirm(
      'Tem certeza que deseja excluir essa configuração de estrutura de projeto? essa ação não poderá ser desfeita.',
      ''
    );

    if (!value) return;

    try {
      await this.baseService.delete(id);

      this.allResources = this.resources.filter(
        (resource) => resource['idConfiguracaoEstrutura'] !== id
      );
    } catch (error) {
      this.globalMessageService.errorMessages.next([
        error?.error?.Erros[0] ??
          `Erro ao excluir a configuração de estrutura de projeto`,
      ]);
    }
  }
}
