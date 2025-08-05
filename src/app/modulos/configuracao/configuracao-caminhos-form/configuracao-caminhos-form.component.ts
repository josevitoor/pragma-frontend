import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfiguracaoCaminhosType } from 'src/app/models/ConfiguracaoCaminhosType';
import { ConfiguracaoCaminhosService } from 'src/app/services/configuracao-caminhos.service';
import { BaseResourceFormComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-configuracao-caminhos-form',
  templateUrl: './configuracao-caminhos-form.component.html'
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
      caminhoArquivoRota: [null, [Validators.required, Validators.maxLength(500)]],
      dataInclusao: [null, [Validators.required]],
      idOperadorInclusao: [null, [Validators.required]],
      idSessao: [null, [Validators.required]],
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
}