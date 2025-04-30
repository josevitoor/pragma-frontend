import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { GenerateBackendFilterType } from 'src/app/models/GenerateBackendFilterType';
import { GenerateService } from 'src/app/services/generate.service';
import { InformationService } from 'src/app/services/information.service';
import { BaseResourceFormComponent } from 'tce-ng-lib';

@Component({
  selector: 'automation-generate-form',
  templateUrl: './generate-form.component.html',
  styleUrls: ['./generate-form.component.css'],
})
export class GenerateFormComponent
  extends BaseResourceFormComponent<GenerateBackendFilterType>
  implements OnInit
{
  service: GenerateService;
  tableNameList: string[] = [];

  constructor(
    protected injector: Injector,
    private formBuilder: FormBuilder,
    private informationService: InformationService
  ) {
    super(new GenerateService(injector));

    this.service = injector.get(GenerateService);

    this.resourceForm = this.formBuilder.group({
      tableName: [null, [Validators.required]],
      entityName: [null, [Validators.required]],
      projectPath: [null, [Validators.required]],
    });
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.tableNameList = await this.informationService.getTableNames();
  }
}
