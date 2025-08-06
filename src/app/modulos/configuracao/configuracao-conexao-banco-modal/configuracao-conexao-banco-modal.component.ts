import {
  Component,
  Injector,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { ConfiguracaoConexaoBancoType } from 'src/app/models/ConfiguracaoConexaoBancoType';
import { ConfiguracaoConexaoBancoService } from 'src/app/services/configuracao-conexao-banco.service';
import { BaseResourceListComponent } from 'tce-ng-lib';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'pragma-configuracao-conexao-banco-modal',
  templateUrl: './configuracao-conexao-banco-modal.component.html',
})
export class ConfiguracaoConexaoBancoModalComponent
  extends BaseResourceListComponent<ConfiguracaoConexaoBancoType>
  implements OnInit
{
  service: ConfiguracaoConexaoBancoService;
  @Output() conexaoSelecionada =
    new EventEmitter<ConfiguracaoConexaoBancoType>();

  constructor(protected injector: Injector, public modalRef: BsModalRef) {
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
   * Seleciona a conexão do banco de dados
   */
  public selecionarConexao(conexao: ConfiguracaoConexaoBancoType): void {
    this.conexaoSelecionada.emit(conexao);
    this.modalRef.hide();
  }
}
