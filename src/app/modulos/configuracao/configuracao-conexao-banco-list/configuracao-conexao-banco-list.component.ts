import { Component, Injector, OnInit } from '@angular/core';
import { ConfiguracaoConexaoBancoType } from 'src/app/models/ConfiguracaoConexaoBancoType';
import { ConfiguracaoConexaoBancoService } from 'src/app/services/configuracao-conexao-banco.service';
import { BaseResourceListComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-configuracao-list',
  templateUrl: './configuracao-conexao-banco-list.component.html',
  styleUrls: ['./configuracao-conexao-banco-list.component.css'],
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
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.allResources = await this.service
      .getAllWithPathAdicional('operador')
      .then();
  }
}
