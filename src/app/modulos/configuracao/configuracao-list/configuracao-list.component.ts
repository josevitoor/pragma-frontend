import { Component, Injector, OnInit } from '@angular/core';
import { ConfiguracaoGeracaoType } from 'src/app/models/ConfiguracaoType';
import { ConfiguracaoGeracaoService } from 'src/app/services/configuracao.service';
import { BaseResourceListComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-configuracao-list',
  templateUrl: './configuracao-list.component.html',
  styleUrls: ['./configuracao-list.component.css'],
})
export class ConfiguracaoListComponent
  extends BaseResourceListComponent<ConfiguracaoGeracaoType>
  implements OnInit
{
  service: ConfiguracaoGeracaoService;

  constructor(protected injector: Injector) {
    super(new ConfiguracaoGeracaoService(injector));
    this.service = injector.get(ConfiguracaoGeracaoService);
    this.inicializarVazio = true;
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.allResources = await this.service
      .getAllWithPathAdicional('operador')
      .then();
  }
}
