import { Component, Injector } from '@angular/core';
import { ConfiguracaoEstruturaProjetoType } from 'src/app/models/ConfiguracaoEstruturaProjetoType';
import { ConfiguracaoEstruturaProjetoService } from 'src/app/services/configuracao-estrutura-projeto.service';
import { BaseResourceListComponent } from 'tce-ng-lib';
import { FormBuilder } from '@angular/forms';

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
}
