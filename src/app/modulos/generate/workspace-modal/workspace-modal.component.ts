import {
  Component,
  Injector,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { BaseResourceListComponent } from 'tce-ng-lib';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { WorkspaceGeracaoType } from 'src/app/models/WorkspaceGeracaoType';
import { WokspaceGeracaoService } from 'src/app/services/workspace-geracao.service';

@Component({
  selector: 'pragma-workspace-modal',
  templateUrl: './workspace-modal.component.html',
})
export class WorkspaceModalComponent
  extends BaseResourceListComponent<WorkspaceGeracaoType>
  implements OnInit
{
  service: WokspaceGeracaoService;
  @Output() workspaceSelecionado = new EventEmitter<WorkspaceGeracaoType>();

  constructor(protected injector: Injector, public modalRef: BsModalRef) {
    super(new WokspaceGeracaoService(injector));
    this.service = injector.get(WokspaceGeracaoService);
    this.inicializarVazio = true;

    this.searchTermFields = {
      nome: true,
      tipoGeracao: true,
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
   * Seleciona o workspace
   */
  public selecionarWorkspace(workspace: WorkspaceGeracaoType): void {
    this.workspaceSelecionado.emit(workspace);
    this.modalRef.hide();
  }
}
