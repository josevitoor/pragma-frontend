import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfiguracaoEstruturaProjetoType } from 'src/app/models/ConfiguracaoEstruturaProjetoType';
import { ConfiguracaoEstruturaProjetoService } from 'src/app/services/configuracao-estrutura-projeto.service';
import { BaseResourceFormComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-configuracao-estrutura-projeto-form',
  templateUrl: './configuracao-estrutura-projeto-form.component.html',
})
export class ConfiguracaoEstruturaProjetoFormComponent
  extends BaseResourceFormComponent<ConfiguracaoEstruturaProjetoType>
  implements OnInit
{
  pageTitle: string;
  service: ConfiguracaoEstruturaProjetoService;
  canEdit: boolean = false;

  constructor(protected injector: Injector, private formBuilder: FormBuilder) {
    super(new ConfiguracaoEstruturaProjetoService(injector));

    this.resourceForm = this.formBuilder.group({
      idConfiguracaoEstrutura: [null],
      nomeEstrutura: [null, [Validators.required, Validators.maxLength(50)]],
      apiDependencyInjectionConfig: [
        null,
        [Validators.required, Validators.maxLength(100)],
      ],
      apiConfigureMap: [null, [Validators.required, Validators.maxLength(100)]],
      apiControllers: [null, [Validators.required, Validators.maxLength(100)]],
      apiEntities: [null, [Validators.required, Validators.maxLength(100)]],
      apiMapping: [null, [Validators.required, Validators.maxLength(100)]],
      apiContexts: [null, [Validators.required, Validators.maxLength(100)]],
      apiServices: [null, [Validators.required, Validators.maxLength(100)]],
      apiImportBaseService: [
        null,
        [Validators.required, Validators.maxLength(50)],
      ],
      apiImportUOW: [null, [Validators.required, Validators.maxLength(50)]],
      apiImportPaginate: [
        null,
        [Validators.required, Validators.maxLength(50)],
      ],
      clientServices: [null, [Validators.required, Validators.maxLength(100)]],
      clientModels: [null, [Validators.required, Validators.maxLength(100)]],
      clientModulos: [null, [Validators.required, Validators.maxLength(100)]],
      clientArquivoRotas: [
        null,
        [Validators.required, Validators.maxLength(100)],
      ],
    });

    this.service = injector.get(ConfiguracaoEstruturaProjetoService);
    this.pageTitle =
      this.currentAction === 'new'
        ? 'CADASTRAR CONFIGURAÇÃO DA ESTRUTURA DO PROJETO'
        : 'EDITAR CONFIGURAÇÃO DA ESTRUTURA DO PROJETO';
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (
      this.currentAction === 'new' ||
      this.resource.idOperadorInclusao == currentUser?.idOperador
    ) {
      this.canEdit = true;
    }
  }
}
