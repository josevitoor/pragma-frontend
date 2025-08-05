import { Component, Injector } from '@angular/core';
import { ConfiguracaoCaminhosType } from 'src/app/models/ConfiguracaoCaminhosType';
import { ConfiguracaoCaminhosService } from 'src/app/services/configuracao-caminhos.service';
import { BaseResourceListComponent } from 'tce-ng-lib';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'pragma-configuracao-caminhos-list',
  templateUrl: './configuracao-caminhos-list.component.html'
})
export class ConfiguracaoCaminhosListComponent extends BaseResourceListComponent<ConfiguracaoCaminhosType> {
  service: ConfiguracaoCaminhosService;

  constructor(private injector: Injector, private formBuilder: FormBuilder) {
    super(new ConfiguracaoCaminhosService(injector));
    this.service = injector.get(ConfiguracaoCaminhosService);
    

    this.resourceFilterForm = this.formBuilder.group({
    });
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
  }
}