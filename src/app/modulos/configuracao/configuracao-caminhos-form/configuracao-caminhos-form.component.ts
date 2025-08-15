import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfiguracaoCaminhosType } from 'src/app/models/ConfiguracaoCaminhosType';
import { ConfiguracaoCaminhosService } from 'src/app/services/configuracao-caminhos.service';
import { BaseResourceFormComponent } from 'tce-ng-lib';

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

  constructor(protected injector: Injector, private formBuilder: FormBuilder) {
    super(new ConfiguracaoCaminhosService(injector));

    this.resourceForm = this.formBuilder.group({
      idConfiguracaoCaminho: [null],
      caminhoApi: [null, [Validators.required, Validators.maxLength(500)]],
      caminhoCliente: [null, [Validators.required, Validators.maxLength(500)]],
      idConfiguracaoEstrutura: [null],
    });

    this.service = injector.get(ConfiguracaoCaminhosService);
    this.pageTitle =
      this.currentAction === 'new'
        ? 'CADASTRAR CONFIGURAÇÃO DE CAMINHO DO PROJETO'
        : 'EDITAR CONFIGURAÇÃO DE CAMINHO DO PROJETO';
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
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
      this.globalMessageService.errorMessages.next([
        error?.error?.Erros[0] ??
          `O caminho informado não é válido para geração de arquivos`,
      ]);
    }
  }
}
