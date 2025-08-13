import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { GenerateFilterType } from 'src/app/models/GenerateFilterType';
import { InformationType } from 'src/app/models/InformationType';
import { GenerateService } from 'src/app/services/generate.service';
import { InformationService } from 'src/app/services/information.service';
import { BaseResourceFormComponent } from 'tce-ng-lib';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfiguracaoConexaoBancoModalComponent } from '../../configuracao/configuracao-conexao-banco-modal/configuracao-conexao-banco-modal.component';
import { ConfiguracaoConexaoBancoType } from 'src/app/models/ConfiguracaoConexaoBancoType';
import { ConfiguracaoCaminhosModalComponent } from '../../configuracao/configuracao-caminhos-modal/configuracao-caminhos-modal.component';
import { ConfiguracaoCaminhosType } from 'src/app/models/ConfiguracaoCaminhosType';
import { ConfiguracaoCaminhosService } from 'src/app/services/configuracao-caminhos.service';

@Component({
  selector: 'pragma-generate-form',
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

  showTceBaseWarning = false;

  modalRef: BsModalRef;

  constructor(
    protected injector: Injector,
    private formBuilder: FormBuilder,
    private informationService: InformationService,
    private caminhosService: ConfiguracaoCaminhosService,
    private bsModalService: BsModalService
  ) {
    super(new GenerateService(injector));

    this.service = injector.get(GenerateService);
    this.service.customMessageSuccess =
      'Arquivos de código CRUD gerados com sucesso!';
    this.informationService.customMessageSuccess =
      'Conexão com banco de dados realizada com sucesso!';

    this.connectionForm = this.formBuilder.group({
      baseDados: [null, [Validators.required, Validators.maxLength(100)]],
      usuario: [null, [Validators.required, Validators.maxLength(50)]],
      senha: [null, [Validators.required, Validators.maxLength(200)]],
      servidor: [null, [Validators.required, Validators.maxLength(200)]],
      porta: [null, [Validators.required]],
    });

    this.pathForm = this.formBuilder.group({
      projectApiPath: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^[A-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*$/
          ),
          Validators.maxLength(500),
        ],
      ],
      projectClientPath: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^[A-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*$/
          ),
          Validators.maxLength(500),
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
      hasTceBase: [true],
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

    this.resourceForm.get('hasTceBase').valueChanges.subscribe((value) => {
      this.showTceBaseWarning = !value;
    });
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
   * Realiza a submissão do formulário com as informações de conexão do banco de dados
   */
  async submitConnectionForm(stepper: MatStepper): Promise<void> {
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

  /**
   * Realiza a submissão do formulário com as informações de caminhos do projeto
   */
  async submitPathForm(stepper: MatStepper) {
    if (this.pathForm.invalid) {
      this.pathForm.markAllAsTouched();
      return;
    }

    const apiPath = this.pathForm.get('projectApiPath')?.value;
    const clientPath = this.pathForm.get('projectClientPath')?.value;
    const routerPath = this.pathForm.get('routerPath')?.value;

    try {
      await this.caminhosService.validateStructure(
        apiPath,
        clientPath,
        routerPath
      );

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
  async submitGenerateInfoForm(): Promise<void> {
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
      hasTceBase: generateFormValues.hasTceBase,
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
        servidor: connectionFormValues.servidor,
        porta: connectionFormValues.porta,
        usuario: connectionFormValues.usuario,
        senha: connectionFormValues.senha,
        baseDados: connectionFormValues.baseDados,
      },
    };
    try {
      await this.service.generateCrudFiles(generateData);

      await this.router.navigate(['dashboard']).then(() => {
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
   * Abre o modal para selecionar as configurações de conexão com banco de dados
   */
  async openModalConfiguracaoConexaoBanco(): Promise<void> {
    this.modalRef = this.bsModalService.show(
      ConfiguracaoConexaoBancoModalComponent,
      {
        class: 'modal-dialog modal-dialog-centered modal-xl',
        focus: true,
        backdrop: 'static',
        keyboard: true,
      }
    );

    this.modalRef?.content?.conexaoSelecionada.subscribe(
      (conexao: ConfiguracaoConexaoBancoType) => {
        this.connectionForm.get('baseDados')?.setValue(conexao?.baseDados);
        this.connectionForm.get('usuario')?.setValue(conexao?.usuario);
        this.connectionForm.get('senha')?.setValue(conexao?.senha);
        this.connectionForm.get('servidor')?.setValue(conexao?.servidor);
        this.connectionForm.get('porta')?.setValue(conexao?.porta);
      }
    );
  }

  /**
   * Abre o modal para selecionar as configurações de caminho do projeto
   */
  async openModalConfiguracaoCaminho(): Promise<void> {
    this.modalRef = this.bsModalService.show(
      ConfiguracaoCaminhosModalComponent,
      {
        class: 'modal-dialog modal-dialog-centered modal-xl',
        focus: true,
        backdrop: 'static',
        keyboard: true,
      }
    );

    this.modalRef?.content?.caminhoSelecionado.subscribe(
      (conexao: ConfiguracaoCaminhosType) => {
        this.pathForm.get('projectApiPath')?.setValue(conexao?.caminhoApi);
        this.pathForm
          .get('projectClientPath')
          ?.setValue(conexao?.caminhoCliente);
        this.pathForm.get('routerPath')?.setValue(conexao?.caminhoArquivoRota);
      }
    );
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
