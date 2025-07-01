import { Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { GenerateFilterType } from 'src/app/models/GenerateFilterType';
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
  extends BaseResourceFormComponent<GenerateFilterType>
  implements OnInit
{
  service: GenerateService;

  tableNameList: string[] = [];
  tableColumnsFilterList: string[] = [];
  informations: InformationType[] = [];

  connectionForm: FormGroup;
  pathForm: FormGroup;

  connectionCompleted = false;
  pathCompleted = false;

  constructor(
    protected injector: Injector,
    private formBuilder: FormBuilder,
    private informationService: InformationService
  ) {
    super(new GenerateService(injector));

    this.service = injector.get(GenerateService);
    this.service.customMessageSuccess =
      'Arquivos de código CRUD gerados com sucesso!';
    this.informationService.customMessageSuccess =
      'Conexão com banco de dados realizada com sucesso!';

    this.connectionForm = this.formBuilder.group({
      database: [null, [Validators.required]],
      user: [null, [Validators.required]],
      password: [null, [Validators.required]],
      host: [null, [Validators.required]],
      port: [null, [Validators.required]],
    });

    this.pathForm = this.formBuilder.group({
      projectApiPath: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^[A-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*$/
          ),
        ],
      ],
      projectClientPath: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^[A-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*$/
          ),
        ],
      ],
      routerPath: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^[A-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*$/
          ),
        ],
      ],
    });

    this.resourceForm = this.formBuilder.group({
      tableName: [null, [Validators.required]],
      entityName: [null, [Validators.required]],
      tableColumnsFilter: [{ value: [], disabled: true }],
      isServerSide: [false],
      tableColumnsList: [{ value: [], disabled: true }, Validators.required],
      tableColumnsFormArray: this.formBuilder.array([]),
    });
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();

    this.resourceForm.get('tableName').valueChanges.subscribe(async (value) => {
      if (value) {
        this.resourceForm.get('tableColumnsFilter').enable();
        this.resourceForm.get('tableColumnsList').enable();
        this.resourceForm.get('tableColumnsFilter').setValue([]);
        this.resourceForm.get('tableColumnsList').setValue([]);
        this.tableColumnsFilterList = this.informations
          .filter((item) => item.tableName === value)
          .map((item) => item.columnName);
      } else {
        this.resourceForm.get('tableColumnsFilter').disable();
        this.resourceForm.get('tableColumnsList').disable();
        this.tableColumnsFilterList = [];
      }
    });

    this.resourceForm
      .get('tableColumnsFilter')
      ?.valueChanges.subscribe(() => this.updateTableColumnsFormArray());

    this.resourceForm
      .get('tableColumnsList')
      ?.valueChanges.subscribe(() => this.updateTableColumnsFormArray());
  }

  private updateTableColumnsFormArray() {
    const filterColumns =
      this.resourceForm.get('tableColumnsFilter')?.value || [];
    const listColumns = this.resourceForm.get('tableColumnsList')?.value || [];

    const allSelectedColumns = Array.from(
      new Set([...filterColumns, ...listColumns])
    );

    const formArray = this.tableColumnsFormArray;
    formArray.clear();

    allSelectedColumns.forEach((column) => {
      formArray.push(
        this.formBuilder.group({
          databaseColumn: [{ value: column, disabled: true }],
          displayName: [this.formatLabel(column)],
        })
      );
    });
  }

  get tableColumnsFormArray(): FormArray {
    return this.resourceForm.get('tableColumnsFormArray') as FormArray;
  }

  /**
   * Realiza a submissão do formulário com as informações de geração de arquivos
   */
  async submitConnectionForm(stepper: MatStepper) {
    if (this.connectionForm.invalid) {
      this.connectionForm.markAllAsTouched();
      return;
    }

    const connectionData = this.connectionForm.value;

    try {
      await this.informationService
        .getAllInformations(connectionData)
        .then((response) => {
          this.informations = response;
          this.tableNameList = [
            ...new Set(response.map((item) => item.tableName)),
          ];
        });

      this.globalMessageService.successMessages.next([
        this.informationService.customMessageSuccess,
      ]);
      this.connectionCompleted = true;
      stepper.next();
    } catch (error) {
      this.globalMessageService.errorMessages.next([
        error?.error?.Erros[0] ??
          `Erro ao conectar com banco de dados. Verifique se os dados informados estão corretos.`,
      ]);
      this.connectionCompleted = false;
    }
  }

  async submitPathForm(stepper: MatStepper) {
    if (this.pathForm.invalid) {
      this.pathForm.markAllAsTouched();
      return;
    }

    const apiPath = this.pathForm.get('projectApiPath')?.value;
    const clientPath = this.pathForm.get('projectClientPath')?.value;
    const routerPath = this.pathForm.get('routerPath')?.value;

    try {
      await this.service.validateStructure(apiPath, clientPath, routerPath);

      this.globalMessageService.successMessages.next([
        'Caminho validado com sucesso!',
      ]);
      this.pathCompleted = true;
      stepper.next();
    } catch (error) {
      this.globalMessageService.errorMessages.next([
        error?.error?.Erros[0] ??
          `O caminho informado não é válido para geração de arquivos`,
      ]);
      this.pathCompleted = false;
    }
  }

  /**
   * Verifica se o formulário com as informações de geração de arquivos está válido e chama o método submit()
   */
  async submitGenerateInfoForm() {
    if (this.resourceForm.invalid) {
      this.resourceForm.markAllAsTouched();
      return;
    }

    const generateFormValues = this.resourceForm.getRawValue();
    const pathFormValues = this.pathForm.getRawValue();
    const connectionFormValues = this.connectionForm.getRawValue();

    const generateData: GenerateFilterType = {
      tableName: generateFormValues.tableName,
      entityName: generateFormValues.entityName,
      isServerSide: generateFormValues.isServerSide,
      tableColumnsFilter: generateFormValues.tableColumnsFilter,
      generateBackendFilter: {
        projectApiPath: pathFormValues.projectApiPath,
      },
      generateFrontendFilter: {
        projectClientPath: pathFormValues.projectClientPath,
        routerPath: pathFormValues.routerPath,
        tableColumnsList: this.tableColumnsFormArray
          .getRawValue()
          .map((item: any) => ({
            databaseColumn: item.databaseColumn,
            displayName: item.displayName,
          })),
      },
      connectionFilter: {
        host: connectionFormValues.host,
        port: connectionFormValues.port,
        user: connectionFormValues.user,
        password: connectionFormValues.password,
        database: connectionFormValues.database,
      },
    };
    try {
      await this.service.generateCrudFiles(generateData);

      await this.router.navigate['dashboard'].then(() => {
        this.globalMessageService.successMessages.next([
          this.service.customMessageSuccess,
        ]);
      });
    } catch (error) {
      this.globalMessageService.errorMessages.next([
        error?.error?.Erros[0] ?? `Erro ao gerar arquivos.`,
      ]);
    }
  }

  /**
   * Adiciona um label padrão
   */
  private formatLabel(column: string): string {
    return column
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
