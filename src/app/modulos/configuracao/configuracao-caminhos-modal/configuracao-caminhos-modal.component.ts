import {
  Component,
  Injector,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { BaseResourceListComponent } from 'tce-ng-lib';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ConfiguracaoCaminhosType } from 'src/app/models/ConfiguracaoCaminhosType';
import { ConfiguracaoCaminhosService } from 'src/app/services/configuracao-caminhos.service';

@Component({
  selector: 'pragma-configuracao-caminhos-modal',
  templateUrl: './configuracao-caminhos-modal.component.html',
})
export class ConfiguracaoCaminhosModalComponent
  extends BaseResourceListComponent<ConfiguracaoCaminhosType>
  implements OnInit
{
  service: ConfiguracaoCaminhosService;
  @Output() caminhoSelecionado = new EventEmitter<ConfiguracaoCaminhosType>();

  constructor(protected injector: Injector, public modalRef: BsModalRef) {
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
   * Seleciona o caminho do projeto
   */
  public selecionarCaminhos(conexao: ConfiguracaoCaminhosType): void {
    this.caminhoSelecionado.emit(conexao);
    this.modalRef.hide();
  }
}
