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

  constructor(protected injector: Injector, private formBuilder: FormBuilder) {
    super(new ConfiguracaoEstruturaProjetoService(injector));

    this.resourceForm = this.formBuilder.group({
      idConfiguracaoEstrutura: [null],
      nomeEstrutura: [null, [Validators.required, Validators.maxLength(100)]],
      apiDependencyInjectionConfig: [
        null,
        [Validators.required, Validators.maxLength(500)],
      ],
      apiConfigureMap: [null, [Validators.required, Validators.maxLength(500)]],
      apiControllers: [null, [Validators.required, Validators.maxLength(500)]],
      apiEntities: [null, [Validators.required, Validators.maxLength(500)]],
      apiMapping: [null, [Validators.required, Validators.maxLength(500)]],
      apiContexts: [null, [Validators.required, Validators.maxLength(500)]],
      apiServices: [null, [Validators.required, Validators.maxLength(500)]],
      clientAppModule: [null, [Validators.required, Validators.maxLength(500)]],
      clientServices: [null, [Validators.required, Validators.maxLength(500)]],
      clientModels: [null, [Validators.required, Validators.maxLength(500)]],
      clientModulos: [null, [Validators.required, Validators.maxLength(500)]],
      clientArquivoRotas: [
        null,
        [Validators.required, Validators.maxLength(500)],
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
  }
}
