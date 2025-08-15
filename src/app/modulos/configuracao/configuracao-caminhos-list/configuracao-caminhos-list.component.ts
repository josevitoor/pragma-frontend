import { Component, Injector } from '@angular/core';
import { ConfiguracaoCaminhosType } from 'src/app/models/ConfiguracaoCaminhosType';
import { ConfiguracaoCaminhosService } from 'src/app/services/configuracao-caminhos.service';
import { BaseResourceListComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-configuracao-caminhos-list',
  templateUrl: './configuracao-caminhos-list.component.html',
})
export class ConfiguracaoCaminhosListComponent extends BaseResourceListComponent<ConfiguracaoCaminhosType> {
  service: ConfiguracaoCaminhosService;

  constructor(protected injector: Injector) {
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
}
