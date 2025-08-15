import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfiguracaoCaminhosType } from 'src/app/models/ConfiguracaoCaminhosType';
import { ConfiguracaoEstruturaProjetoType } from 'src/app/models/ConfiguracaoEstruturaProjetoType';
import { ConfiguracaoCaminhosService } from 'src/app/services/configuracao-caminhos.service';
import { ConfiguracaoEstruturaProjetoService } from 'src/app/services/configuracao-estrutura-projeto.service';
import { AlertsService, BaseResourceFormComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-configuracao-caminhos-form',
  templateUrl: './configuracao-caminhos-form.component.html',
})
export class ConfiguracaoCaminhosFormComponent
  extends BaseResourceFormComponent<ConfiguracaoCaminhosType>
  implements OnInit
{
  pageTitle: string;
  service: ConfiguracaoCaminhosService;
  configuracoesEstruturas: ConfiguracaoEstruturaProjetoType[];

  constructor(
    protected injector: Injector,
    private formBuilder: FormBuilder,
    private estruturaService: ConfiguracaoEstruturaProjetoService,
    private alert: AlertsService
  ) {
    super(new ConfiguracaoCaminhosService(injector));

    this.resourceForm = this.formBuilder.group({
      idConfiguracaoCaminho: [null],
      caminhoApi: [null, [Validators.required, Validators.maxLength(500)]],
      caminhoCliente: [null, [Validators.required, Validators.maxLength(500)]],
      idConfiguracaoEstrutura: [null, [Validators.required]],
    });

    this.service = injector.get(ConfiguracaoCaminhosService);
    this.pageTitle =
      this.currentAction === 'new'
        ? 'CADASTRAR CONFIGURAÇÃO DE CAMINHO DO PROJETO'
        : 'EDITAR CONFIGURAÇÃO DE CAMINHO DO PROJETO';
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.configuracoesEstruturas = await this.estruturaService.getAll().then();
  }

  /**
   * Realiza a submissão do formulário com as informações de caminhos do projeto
   */
  async submitPathForm() {
    if (this.resourceForm.invalid) {
      this.resourceForm.markAllAsTouched();
      return;
    }

    const apiPath = this.resourceForm.get('caminhoApi')?.value;
    const clientPath = this.resourceForm.get('caminhoCliente')?.value;
    const idEstrutura = this.resourceForm.get('idConfiguracaoEstrutura')?.value;

    try {
      await this.service.validateStructure(apiPath, clientPath, idEstrutura);

      Object.assign(
        this.resource,
        this.resourceForm.value as ConfiguracaoCaminhosType
      );
      await this.submit();
    } catch (error) {
      this.alert.error(
        'Erro!',
        error?.error?.Erros[0] ??
          `O caminho informado não é válido para geração de arquivos`
      );
    }
  }
}
