import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfiguracaoConexaoBancoType } from 'src/app/models/ConfiguracaoConexaoBancoType';
import { ConfiguracaoConexaoBancoService } from 'src/app/services/configuracao-conexao-banco.service';
import { BaseResourceFormComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-configuracao-conexao-banco-form',
  templateUrl: './configuracao-conexao-banco-form.component.html',
})
export class ConfiguracaoConexaoBancoFormComponent
  extends BaseResourceFormComponent<ConfiguracaoConexaoBancoType>
  implements OnInit
{
  pageTitle: string;
  service: ConfiguracaoConexaoBancoService;

  constructor(protected injector: Injector, private formBuilder: FormBuilder) {
    super(new ConfiguracaoConexaoBancoService(injector));

    this.resourceForm = this.formBuilder.group({
      baseDados: [null, [Validators.required, Validators.maxLength(100)]],
      usuario: [null, [Validators.required, Validators.maxLength(50)]],
      senha: [null, [Validators.required, Validators.maxLength(200)]],
      servidor: [null, [Validators.required, Validators.maxLength(200)]],
      porta: [null, [Validators.required]],
    });

    this.service = injector.get(ConfiguracaoConexaoBancoService);
    this.pageTitle =
      this.currentAction === 'new'
        ? 'CADASTRAR CONFIGURAÇÃO DE CONEXÃO DO BANCO DE DADOS'
        : 'EDITAR CONFIGURAÇÃO DE CONEXÃO DO BANCO DE DADOS';
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
  }
}
