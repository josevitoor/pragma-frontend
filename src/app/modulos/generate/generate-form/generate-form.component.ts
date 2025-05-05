import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { GenerateBackendFilterType } from 'src/app/models/GenerateBackendFilterType';
import { InformationType } from 'src/app/models/InformationType';
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
  tableColumnsFilterList: InformationType[] = [];

  constructor(
    protected injector: Injector,
    private formBuilder: FormBuilder,
    private informationService: InformationService
  ) {
    super(new GenerateService(injector));

    this.service = injector.get(GenerateService);
    this.service.customMessageSuccess =
      'Arquivos de código CRUD gerados com sucesso!';

    this.resourceForm = this.formBuilder.group({
      tableName: [null, [Validators.required]],
      entityName: [null, [Validators.required]],
      projectApiPath: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^[A-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*$/
          ),
        ],
      ],
      tableColumnsFilter: [{ value: [], disabled: true }],
      isServerSide: [false],
    });
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();

    this.tableNameList = await this.informationService.getTableNames();
    this.resourceForm.get('tableName').valueChanges.subscribe(async (value) => {
      if (value) {
        this.resourceForm.get('tableColumnsFilter').enable();
        this.tableColumnsFilterList =
          await this.informationService.getTableColumns(value);
      } else {
        this.resourceForm.get('tableColumnsFilter').disable();
        this.tableColumnsFilterList = [];
      }
    });
  }

  /**
   * Realiza a submissão do formulário
   */
  async submit() {
    try {
      await this.service.generateCrudFiles(this.resource);

      this.globalMessageService.successMessages.next([
        this.service.customMessageSuccess,
      ]);

      this.resetForm();
    } catch (error) {
      this.globalMessageService.errorMessages.next([
        `Erro ao gerar os arquivos. ${error?.error?.Message}`,
      ]);
    }
  }

  /**
   * Reseta o fómulário após o submit
   */
  resetForm(): void {
    this.resourceForm.reset();
    this.resourceForm.markAsPristine();
    this.resourceForm.markAsUntouched();
  }
}
