import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { GenerateFilterType } from 'src/app/models/GenerateFilterType';
import { InformationType } from 'src/app/models/InformationType';
import { GenerateService } from 'src/app/services/generate.service';
import { InformationService } from 'src/app/services/information.service';
import { AlertsService, BaseResourceFormComponent } from 'tce-ng-lib';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfiguracaoConexaoBancoModalComponent } from '../../configuracao/configuracao-conexao-banco-modal/configuracao-conexao-banco-modal.component';
import { ConfiguracaoConexaoBancoType } from 'src/app/models/ConfiguracaoConexaoBancoType';
import { ConfiguracaoCaminhosModalComponent } from '../../configuracao/configuracao-caminhos-modal/configuracao-caminhos-modal.component';
import { ConfiguracaoCaminhosType } from 'src/app/models/ConfiguracaoCaminhosType';
import { ConfiguracaoCaminhosService } from 'src/app/services/configuracao-caminhos.service';
import { ConfiguracaoEstruturaProjetoType } from 'src/app/models/ConfiguracaoEstruturaProjetoType';
import { ConfiguracaoEstruturaProjetoService } from 'src/app/services/configuracao-estrutura-projeto.service';
import * as go from 'gojs';
import { Links, Nodes } from 'src/app/constants/InitialModel';
import { GenerateSqlRequest, LinkDto, TableDto } from 'src/app/models/GenerateSqlType';
import { ActivatedRoute } from '@angular/router';
import { GenerateBatchFilterType } from 'src/app/models/GenerateBatchFilterType';
import { SqlTypes } from 'src/app/constants/SqlTypes';
import { GenerateWorkspaceType } from 'src/app/models/GenerateWorkspaceType';
import { WokspaceGeracaoService } from 'src/app/services/workspace-geracao.service';
import { WorkspaceGeracaoType } from 'src/app/models/WorkspaceGeracaoType';
import { TipoGeracaoEnum } from 'src/app/enum/TipoGeracaoEnum';
import { WorkspaceModalComponent } from '../workspace-modal/workspace-modal.component';

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
  configuracoesEstruturas!: ConfiguracaoEstruturaProjetoType[];

  connectionForm: FormGroup;
  pathForm: FormGroup;

  connectionCompleted = false;
  pathCompleted = false;

  showTceBaseWarning = false;
  isSqlStructureUpdated = true;

  modalRef!: BsModalRef;

  diagram!: go.Diagram;
  nodes = Nodes;
  links = Links;

  sqlGerado: string | null = null;
  @ViewChild('sqlSection') sqlSection!: ElementRef;

  erEditor: boolean = false;
  sqlEditor: boolean = false;

  isEditWorkspace: boolean = false;
  idWorkspaceAtual: number | undefined = undefined;

  constructor(
    protected injector: Injector,
    private formBuilder: FormBuilder,
    private informationService: InformationService,
    private caminhosService: ConfiguracaoCaminhosService,
    private bsModalService: BsModalService,
    private alert: AlertsService,
    private configEstrutura: ConfiguracaoEstruturaProjetoService,
    private activateRoute: ActivatedRoute,
    private workspaceService: WokspaceGeracaoService
  ) {
    super(new GenerateService(injector));

    this.service = injector.get(GenerateService);
    this.service.customMessageSuccess =
      'CRUD gerado com sucesso! Os arquivos de código foram criados no diretório de destino. Para visualizar a tela, cadastre as permissões correspondentes no módulo TCE-Admin e execute o projeto.';
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
      idConfiguracaoEstrutura: [null, [Validators.required]],
    });

    this.resourceForm = this.formBuilder.group({
      tableName: [null],
      entityName: [null],
      tableColumnsFilter: [{ value: [], disabled: true }],
      isServerSide: [false],
      hasTceBase: [true],
      hasApiVersion: [false],
      tableColumnsList: [{ value: [], disabled: true }],
      tableColumnsFormArray: this.formBuilder.array([]),
      erTables: this.formBuilder.array([]),
      sqlScript: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();

    this.resourceForm.get('tableName')?.valueChanges.subscribe(async (value) => {
      if (value) {
        this.resourceForm.get('tableColumnsFilter')?.enable();
        this.resourceForm.get('tableColumnsList')?.enable();
        this.resourceForm.get('tableColumnsFilter')?.setValue([]);
        this.resourceForm.get('tableColumnsList')?.setValue([]);
        this.tableColumnsFilterList = this.informations
          .filter((item) => item.tableName === value)
          .map((item) => item.columnName);
      } else {
        this.resourceForm.get('tableColumnsFilter')?.disable();
        this.resourceForm.get('tableColumnsList')?.disable();
        this.tableColumnsFilterList = [];
      }
    });

    this.resourceForm
      .get('tableColumnsFilter')
      ?.valueChanges.subscribe(() => this.updateTableColumnsFormArray());

    this.resourceForm
      .get('tableColumnsList')
      ?.valueChanges.subscribe(() => this.updateTableColumnsFormArray());

    this.resourceForm.get('hasTceBase')?.valueChanges.subscribe((value) => {
      this.showTceBaseWarning = !value;
    });

    this.resourceForm.get('sqlScript')?.valueChanges.subscribe(() => {
      this.isSqlStructureUpdated = false;
    });

    this.configuracoesEstruturas = await this.configEstrutura.getAll().then();

    this.activateRoute.queryParams.subscribe(async (params) => {
      this.erEditor = params['erEditor'] === 'true';
      this.sqlEditor = params['sqlEditor'] === 'true';

      if (this.erEditor) {
        const model = this.service.getErModel();
        if (!model) {
          this.router.navigate(['/dashboard/gerador/modelagem-relacional']);
          return;
        }

        this.resourceForm.get('tableName')?.clearValidators();
        this.resourceForm.get('entityName')?.clearValidators();
        this.resourceForm.get('tableColumnsList')?.clearValidators();

        this.resourceForm.get('tableName')?.updateValueAndValidity();
        this.resourceForm.get('entityName')?.updateValueAndValidity();
        this.resourceForm.get('tableColumnsList')?.updateValueAndValidity();

        await this.waitAndInitDiagram(model);
      } else if (this.sqlEditor) {
        const sql = this.service.getSqlScript();
        if (!sql) {
          this.router.navigate(['/dashboard/gerador/modelagem-sql']);
          return;
        }

        this.resourceForm.get('tableName')?.clearValidators();
        this.resourceForm.get('entityName')?.clearValidators();
        this.resourceForm.get('tableColumnsList')?.clearValidators();

        this.resourceForm.get('tableName')?.updateValueAndValidity();
        this.resourceForm.get('entityName')?.updateValueAndValidity();
        this.resourceForm.get('tableColumnsList')?.updateValueAndValidity();

        this.resourceForm.get('sqlScript')?.setValue(sql);
        this.isSqlStructureUpdated = true;

        const result = this.service.parseSqlToDiagram(sql);

        this.buildErTablesFromSql(result.nodes);
      } else {
        (this.resourceForm.get('erTables') as FormArray).clear();

        this.resourceForm.get('tableName')?.setValidators([Validators.required]);
        this.resourceForm.get('entityName')?.setValidators([Validators.required]);
        this.resourceForm.get('tableColumnsList')?.setValidators([Validators.required]);

        this.resourceForm.get('tableName')?.updateValueAndValidity();
        this.resourceForm.get('entityName')?.updateValueAndValidity();
        this.resourceForm.get('tableColumnsList')?.updateValueAndValidity();
      }
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
          databaseColumn: [column],
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
  async submitConnectionForm(stepper?: MatStepper): Promise<void> {
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
      if (stepper) {
        stepper.next();
      }
    } catch (error) {
      this.alert.error(
        'Erro!',
        (error as any)?.error?.Erros[0] ??
          `Erro ao conectar com banco de dados. Verifique se os dados informados estão corretos.`
      );
      this.connectionCompleted = false;
    }
  }

  /**
   * Realiza a submissão do formulário com as informações de caminhos do projeto
   */
  async submitPathForm(stepper?: MatStepper) {
    if (this.pathForm.invalid) {
      this.pathForm.markAllAsTouched();
      return;
    }

    const apiPath = this.pathForm.get('projectApiPath')?.value;
    const clientPath = this.pathForm.get('projectClientPath')?.value;
    const idEstrutura = this.pathForm.get('idConfiguracaoEstrutura')?.value;

    try {
      await this.caminhosService.validateStructure(
        apiPath,
        clientPath,
        idEstrutura
      );

      this.globalMessageService.successMessages.next([
        'Caminho validado com sucesso!',
      ]);
      this.pathCompleted = true;
      if (stepper) {
        stepper.next();
      }
    } catch (error) {
      this.alert.error(
        'Erro!',
        (error as any)?.error?.Erros[0] ??
          `O caminho informado não é válido para geração de arquivos`
      );
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

    const pathFormValues = this.pathForm.getRawValue();
    const connectionFormValues = this.connectionForm.getRawValue();

    let items: GenerateFilterType[] = [];

    if (this.erEditor || this.sqlEditor) { 
      let validationErrors: string[] = [];

      if (this.erEditor) {
        validationErrors = this.validateModel();
      } else {
        const sql = this.resourceForm.get('sqlScript')?.value?.trim();

        if (!sql) {
          await this.alert.warning('Atenção!', 'Nenhum script SQL encontrado para geração.');
          return;
        }

        validationErrors = this.validateSqlModel(sql);
      }

      if (validationErrors.length > 0) {
        await this.alert.errorHtml('Erros de validação!', validationErrors.join('<br>'));
        return;
      }

      const erTables = this.resourceForm.get('erTables')?.value || [];

      items = erTables.map((table: any) => ({
        tableName: table.tableName,
        entityName: table.entityName,
        isServerSide: table.isServerSide,
        hasTceBase: table.hasTceBase,
        hasApiVersion: table.hasApiVersion,
        tableColumnsFilter: table.tableColumnsFilter,
        generateFrontendFilter: {
          projectClientPath: pathFormValues.projectClientPath,
          tableColumnsList: (table.tableColumnsFormArray || []).map((c: any) => ({
            databaseColumn: c.databaseColumn,
            displayName: c.displayName
          }))
        },
        idConfiguracaoEstrutura: pathFormValues.idConfiguracaoEstrutura,
        generateBackendFilter: {
          projectApiPath: pathFormValues.projectApiPath
        },
        connectionFilter: {
          servidor: connectionFormValues.servidor,
          porta: connectionFormValues.porta,
          usuario: connectionFormValues.usuario,
          senha: connectionFormValues.senha,
          baseDados: connectionFormValues.baseDados,
        }
      }));
    } else {
      const form = this.resourceForm.getRawValue();

      items = [{
        tableName: form.tableName,
        entityName: form.entityName,
        isServerSide: form.isServerSide,
        hasTceBase: form.hasTceBase,
        hasApiVersion: form.hasApiVersion,
        tableColumnsFilter: form.tableColumnsFilter,

        generateFrontendFilter: {
          projectClientPath: pathFormValues.projectClientPath,
          tableColumnsList: this.tableColumnsFormArray
            .getRawValue()
            .map((item: any) => ({
              databaseColumn: item.databaseColumn,
              displayName: item.displayName,
            })),
        },
        idConfiguracaoEstrutura: pathFormValues.idConfiguracaoEstrutura,
        generateBackendFilter: {
          projectApiPath: pathFormValues.projectApiPath
        },
        connectionFilter: {
          servidor: connectionFormValues.servidor,
          porta: connectionFormValues.porta,
          usuario: connectionFormValues.usuario,
          senha: connectionFormValues.senha,
          baseDados: connectionFormValues.baseDados,
        }
      }];
    }

    const payload: GenerateBatchFilterType = { items }

    try {
      if (this.erEditor || this.sqlEditor) {
        let script = '';
        let tabelas: string[] = [];

        if (this.erEditor) {
          const model = this.diagram.model as go.GraphLinksModel;
          tabelas = model.nodeDataArray.map((t: any) => t.key);
          script = await this.gerarSqlPreview(true) as string;
        } else {
          script = this.resourceForm.get('sqlScript')?.value;
          const result = this.service.parseSqlToDiagram(script);
          tabelas = result.nodes.map((n: any) => n.key);
        }
        
        if (!script || !tabelas) {
          await this.alert.warning('Atenção!', 'É necessário ter dados do script SQL preenchidos para este tipo de geração de código.');
          return;
        }

        this.informationService.blockInterceptation();

        await this.informationService.executeScript({
          filter: {
            servidor: connectionFormValues.servidor,
            porta: connectionFormValues.porta,
            usuario: connectionFormValues.usuario,
            senha: connectionFormValues.senha,
            baseDados: connectionFormValues.baseDados
          },
          script,
          tabelas
        });
      }

      await this.service.generateCrudFiles(payload);

      await this.router.navigate(['dashboard']).then(() => {
        this.globalMessageService.successMessages.next([
          this.service.customMessageSuccess,
        ]);
      });
    } catch (error) {
      await this.alert.error(
        'Erro!',
        (error as any)?.error?.Erros[0] ?? `Erro ao gerar arquivos.`
      );
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
        this.pathForm
          .get('idConfiguracaoEstrutura')
          ?.setValue(conexao?.idConfiguracaoEstrutura);
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

  private createErTableFormGroup(table: any): FormGroup {
    const group = this.formBuilder.group({
      tableName: [table.key],
      entityName: [table.key, Validators.required],
      tableColumnsList: [[]],
      tableColumnsFilter: [[]],
      columnsOptions: [table.columns.map((col: any) => ({
        label: col.name,
        value: col.name
      }))],
      tableColumnsFormArray: this.formBuilder.array([])
    });

    group.get('tableColumnsList')?.valueChanges.subscribe(() => {
      this.updateErTableColumnsFormArray(group);
    });

    group.get('tableColumnsFilter')?.valueChanges.subscribe(() => {
      this.updateErTableColumnsFormArray(group);
    });

    return group;
  }

  private buildErTables() {
    const nodes = this.diagram.model.nodeDataArray;
    const erTables = this.resourceForm.get('erTables') as FormArray;

    erTables.clear();

    nodes.forEach((table: any) => {
      erTables.push(this.createErTableFormGroup(table));
    });
  }

  private updateErTableColumnsFormArray(tableGroup: AbstractControl) {

    const filterColumns = tableGroup.get('tableColumnsFilter')?.value || [];
    const listColumns = tableGroup.get('tableColumnsList')?.value || [];

    const allSelectedColumns = Array.from(
      new Set([...filterColumns, ...listColumns])
    );

    const formArray = tableGroup.get('tableColumnsFormArray') as FormArray;

    formArray.clear();

    allSelectedColumns.forEach((column) => {
      formArray.push(
        this.formBuilder.group({
          databaseColumn: [column],
          displayName: [this.formatLabel(column)]
        })
      );
    });
  }

  /**
   * Aplica o modelo de ER criado no diagrama para o formulário, sincronizando as tabelas e colunas selecionadas
   */
  private applyModel(model: any) {
    this.nodes = model.tables;
    this.links = model.links;

    const diagramModel = new go.GraphLinksModel(this.nodes, this.links);
    diagramModel.linkFromPortIdProperty = "fromColumn";
    diagramModel.linkToPortIdProperty = "toColumn";
    this.diagram.model = diagramModel;

    this.buildErTables();
  }

  /**
   * Inicializa o diagrama de ER utilizando a biblioteca GoJS
   */
  private initDiagram() {
    const $ = go.GraphObject.make;

    this.diagram = $(go.Diagram, 'diagramDiv', {
      'undoManager.isEnabled': true,
      linkingTool: $(go.LinkingTool),
      relinkingTool: $(go.RelinkingTool)
    });

    this.diagram.nodeTemplate =
    $(go.Node, "Auto",
      $(go.Shape, "RoundedRectangle",
        { fill: "#fff", stroke: "#3C7B6C", strokeWidth: 2 }
      ),

      $(go.Panel, "Vertical",

        // Titulo da tabela
        $(go.Panel, "Auto",
          { stretch: go.GraphObject.Horizontal },
          $(go.Shape, { fill: "#3C7B6C", stroke: null }),
          $(go.TextBlock,
            {
              margin: 6,
              stroke: "white",
              font: "bold 13px sans-serif",
              editable: true
            },
            new go.Binding("text", "key").makeTwoWay()
          )
        ),

        // Colunas
        $(go.Panel, "Table",
          { stretch: go.GraphObject.Horizontal },

            $(go.Panel, "TableRow",
              { background: "#f5f5f5" },

              $(go.TextBlock, "Nome", { column: 0, margin: 2, font: "bold 11px sans-serif", width: 110 }),
              $(go.TextBlock, "Tipo", { column: 1, margin: 2, font: "bold 11px sans-serif", width: 118 }),
              $(go.TextBlock, "PK", { column: 2, margin: 2, font: "bold 11px sans-serif", width: 33 }),
              $(go.TextBlock, "FK", { column: 3, margin: 2, font: "bold 11px sans-serif", width: 33 }),
              $(go.TextBlock, "NN", { column: 4, margin: 2, font: "bold 11px sans-serif", width: 33 }),
              $(go.TextBlock, "UQ", { column: 5, margin: 2, font: "bold 11px sans-serif", width: 33 }),
              $(go.TextBlock, "AI", { column: 6, margin: 2, font: "bold 11px sans-serif", width: 33 }),
              $(go.TextBlock, "", { column: 7, width: 40 })
            )
          ),

          $(go.Panel, "Table",
          {
            padding: 4,
            defaultAlignment: go.Spot.Left
          },
          new go.Binding("itemArray", "columns"),
          {
            itemTemplate:
              $(go.Panel, "TableRow",
                {
                  fromLinkable: true,
                  toLinkable: true,
                  fromLinkableSelfNode: true,
                  toLinkableSelfNode: true,
                  cursor: "pointer",
                  portId: ""
                },
                new go.Binding("portId", "name"),

                // Nome
                $(go.TextBlock,
                  { column: 0, margin: 2, editable: true, width: 110 },
                  new go.Binding("text", "name").makeTwoWay()
                ),

                // Tipo
                $(go.TextBlock,
                  { column: 1, margin: 2, width: 110, editable: true },
                  new go.Binding("text", "type").makeTwoWay()
                ),

                // PK
                $("Button",
                  {
                    column: 2,
                    width: 35,
                    click: (e, obj) => {
                      const data = obj.part?.data;
                      const item = obj.panel?.data;

                      if (!data || !item) return;

                      this.diagram.model.startTransaction("toggle pk");

                      item.pk = !item.pk;

                      if (item.pk && item.ai === undefined) {
                        item.ai = true;
                      }
                      if (item.pk && item.nn === undefined) {
                        item.nn = true;
                      }

                      this.diagram.model.updateTargetBindings(data);
                      this.diagram.model.commitTransaction("toggle pk");
                    }
                  },
                  $(go.TextBlock, new go.Binding("text", "pk", v => v ? "✔" : "-"))
                ),

                // FK
                $("Button",
                  {
                    column: 3,
                    width: 35,
                    click: (e, obj) => {
                      const data = obj.part?.data;
                      const item = obj.panel?.data;

                      if (!data || !item) return;

                      this.diagram.model.startTransaction("toggle fk");
                      item.fk = !item.fk;
                      this.diagram.model.updateTargetBindings(data);
                      this.diagram.model.commitTransaction("toggle fk");
                    }
                  },
                  $(go.TextBlock, new go.Binding("text", "fk", v => v ? "✔" : "-"))
                ),

                // NN
                $("Button",
                  {
                    column: 4,
                    width: 35,
                    click: (e, obj) => {
                      const data = obj.part?.data;
                      const item = obj.panel?.data;

                      if (!data || !item) return;

                      this.diagram.model.startTransaction("toggle nn");
                      item.nn = !item.nn;
                      this.diagram.model.updateTargetBindings(data);
                      this.diagram.model.commitTransaction("toggle nn");
                    }
                  },
                  $(go.TextBlock, new go.Binding("text", "nn", v => v ? "✔" : "-"))
                ),

                // UQ
                $("Button",
                  {
                    column: 5,
                    width: 35,
                    click: (e, obj) => {
                      const data = obj.part?.data;
                      const item = obj.panel?.data;

                      if (!data || !item) return;

                      this.diagram.model.startTransaction("toggle uq");
                      item.uq = !item.uq;
                      this.diagram.model.updateTargetBindings(data);
                      this.diagram.model.commitTransaction("toggle uq");
                    }
                  },
                  $(go.TextBlock, new go.Binding("text", "uq", v => v ? "✔" : "-"))
                ),

                // AI
                $("Button",
                  {
                    column: 6,
                    width: 35,
                    click: (e, obj) => {
                      const data = obj.part?.data;
                      const item = obj.panel?.data;

                      if (!data || !item) return;

                      this.diagram.model.startTransaction("toggle ai");
                      item.ai = !item.ai;
                      this.diagram.model.updateTargetBindings(data);
                      this.diagram.model.commitTransaction("toggle ai");
                    }
                  },
                  $(go.TextBlock, new go.Binding("text", "ai", v => v ? "✔" : "-"))
                ),

                // DELETE
                $("Button",
                  {
                    column: 7,
                    width: 35,
                    click: (e, obj) => {
                      const node = obj.part?.data;
                      const column = obj.panel?.data;
                      if (!node || !column) return;

                      const model = this.diagram.model as go.GraphLinksModel;
                      this.diagram.model.startTransaction("remove column");
                      const linksToRemove = model.linkDataArray.filter((l: any) =>
                        (l.from === node.key && l.fromColumn === column.name) ||
                        (l.to === node.key && l.toColumn === column.name)
                      );

                      linksToRemove.forEach((l: any) => model.removeLinkData(l));
                      model.removeArrayItem(node.columns, node.columns.indexOf(column));
                      this.diagram.model.commitTransaction("remove column");
                    }
                  },
                  $(go.TextBlock, "🗑")
                )
              )
          }
        ),

        // Adicionar coluna
        $("Button",
          {
            margin: 5,
            click: (e, obj) => {
              const node = obj.part?.data;
              this.addColumn(node);
            }
          },
          $(go.TextBlock, "adicionar coluna")
        )
      )
    );

    this.diagram.linkTemplate =
    $(go.Link,
      {
        routing: go.Link.AvoidsNodes,
        corner: 20,
        reshapable: true,
        resegmentable: true
      },

      new go.Binding("fromSpot", "", (d, obj) => {
        const link = obj.part;
        return link?.fromNode === link?.toNode ? go.Spot.Right : go.Spot.Right;
      }),

      new go.Binding("toSpot", "", (d, obj) => {
        const link = obj.part;
        return link?.fromNode === link?.toNode ? go.Spot.Right : go.Spot.Left;
      }),

      $(go.Shape, { strokeWidth: 2, stroke: "#555" }),
      $(go.Shape, { toArrow: "Standard" })
    );

    // Validação para evitar criação de links duplicados e garantir que o destino seja uma PK
    this.diagram.toolManager.linkingTool.linkValidation = (fromNode, fromPort, toNode, toPort) => {
      const model = this.diagram.model as go.GraphLinksModel;
      const links = model.linkDataArray;

      const fromTable = fromNode.data;
      const toTable = toNode.data;

      const fromColumnName = fromPort.portId;
      const toColumnName = toPort.portId;

      const fromColumn = fromTable.columns?.find((c: any) => c.name === fromColumnName);
      const toColumn = toTable.columns?.find((c: any) => c.name === toColumnName);

      if (!fromColumn || !toColumn) return false;

      if (!toColumn.pk) return false;

      if (fromTable.key === toTable.key && fromColumnName === toColumnName) {
        return false;
      }

      const alreadyLinked = links.some((l: any) =>
        l.from === fromTable.key &&
        l.fromColumn === fromColumnName
      );

      if (alreadyLinked) return false;

      const duplicate = links.some((l: any) =>
        l.from === fromTable.key &&
        l.to === toTable.key &&
        l.fromColumn === fromColumnName &&
        l.toColumn === toColumnName
      );

      if (duplicate) return false;

      return true;
    };

    // Listener para marcar coluna como FK ao criar um link
    this.diagram.addDiagramListener("LinkDrawn", (e) => {
      const link = e.subject;
      const fromNode = link.fromNode.data;
      const fromColumnName = link.data.fromColumn;

      this.diagram.model.startTransaction("set fk");

      const fromColumn = fromNode.columns?.find((c: any) => c.name === fromColumnName);

      if (fromColumn) {
        fromColumn.fk = true;
      }

      this.diagram.model.updateTargetBindings(fromNode);
      this.diagram.model.commitTransaction("set fk");
    });

    // Listener para sincronizar o formulário com o diagrama
    this.diagram.addModelChangedListener((e) => {
      if (e.isTransactionFinished) {
        if (this.erEditor) {
          this.syncErFormWithDiagram();
        }
      }
    });

    // Listener para atualizar FK ao mudar nome da coluna
    this.diagram.addModelChangedListener((e) => {

      if (e.change === go.ChangedEvent.Property && e.propertyName === 'name') {
        const oldName = e.oldValue;
        const newName = e.newValue;

        if (!oldName || !newName || oldName === newName) {
          return;
        }

        const model = this.diagram.model as go.GraphLinksModel;

        model.startTransaction('update fk links');

        model.linkDataArray.forEach((link: any) => {
          if (link.fromColumn === oldName) {
            model.setDataProperty(link, 'fromColumn', newName);
          }

          if (link.toColumn === oldName) {
            model.setDataProperty(link, 'toColumn', newName);
          }
        });

        model.commitTransaction('update fk links');
      }
    });

    const model = new go.GraphLinksModel(this.nodes, this.links);
    model.linkFromPortIdProperty = "fromColumn";
    model.linkToPortIdProperty = "toColumn";
    this.diagram.model = model;
  }

 /**
   * Adiciona nova tabela ao diagrama
   */
  addTable() {
    const table = {
      key: 'TabelaNova',
      columns: [
        { name: 'Id', type: 'INT', pk: true, fk: false, nn: true, uq: false, ai: true }
      ]
    };

    this.diagram.model.addNodeData(table);

    const erTables = this.resourceForm.get('erTables') as FormArray;

    erTables.push(this.createErTableFormGroup(table));
  }

  /**
   * Adiciona uma nova coluna a uma tabela existente
   */
  addColumn(node: any) {

    this.diagram.model.startTransaction("add column");

    if (!node.columns) node.columns = [];

    node.columns.push({
      name: "CampoNovo",
      type: "INT",
      pk: false,
      fk: false,
      nn: false,
      uq: false,
      ai: false
    });

    this.diagram.model.updateTargetBindings(node);

    this.diagram.model.commitTransaction("add column");
  }

  /**
   * Adiciona uma nova tabela ao formulário de ER com base em um nó do diagrama
   */
  private addErTable(node: any) {
    const erTables = this.resourceForm.get('erTables') as FormArray;

    const group = this.formBuilder.group({
      tableName: [node.key],
      entityName: [node.key, Validators.required],
      tableColumnsList: [[]],
      tableColumnsFilter: [[]],
      columnsOptions: [node.columns.map((c: any) => ({
        label: c.name,
        value: c.name
      }))],
      tableColumnsFormArray: this.formBuilder.array([])
    });

    erTables.push(group);
  }

  /**
   * Gera o script SQL com base no modelo do diagrama
   */
  async gerarSqlPreview(retorna: boolean = false) : Promise<string | void> {
    const model = this.diagram.model as go.GraphLinksModel;

    const payload: GenerateSqlRequest = {
      tables: model.nodeDataArray as TableDto[],
      links: model.linkDataArray as LinkDto[]
    };

    this.sqlGerado = this.service.generateSql(payload);

    if (retorna) return this.sqlGerado;

    setTimeout(() => {
      this.sqlSection?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  /**
   * Realiza o download do script SQL gerado a partir do modelo do diagrama
   */
  downloadSql() {
    if (!this.sqlGerado) return;

    const blob = new Blob([this.sqlGerado], {
      type: 'text/sql;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.sql';
    a.click();

    window.URL.revokeObjectURL(url);
  }

  /**
  * Importa um script SQL, realiza o parsing para extrair tabelas, colunas e relacionamentos, e atualiza o diagrama de ER com base no modelo extraído do SQL
  */
  async importSql(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();

    const result = this.service.parseSqlToDiagram(text);

    this.nodes = result.nodes;
    this.links = result.links;

    const model = new go.GraphLinksModel(this.nodes, this.links);
    model.linkFromPortIdProperty = "fromColumn";
    model.linkToPortIdProperty = "toColumn";
    this.diagram.model = model;
  }

  /**
  * Copia o script SQL gerado para a área de transferência do usuário.
  */
  copySql() {
    if ((this.erEditor && !this.sqlGerado) || (this.sqlEditor && !this.resourceForm.get('sqlScript')?.value)) return;

    const sql = this.erEditor ? this.sqlGerado : this.resourceForm.get('sqlScript')?.value;
    navigator.clipboard.writeText(sql);
  }

  /**
   * Sincroniza o formulário de ER com o modelo do diagrama
   */
  private syncErFormWithDiagram() {
    const model = this.diagram.model as go.GraphLinksModel;
    const nodes = model.nodeDataArray;

    const erTables = this.resourceForm.get('erTables') as FormArray;
    nodes.forEach((node: any) => {
      let tableForm = erTables.controls.find(
        (t: any) => t.get('tableName')?.value === node.key
      );

      if (!tableForm) {
        this.addErTable(node);
        return;
      }

      this.syncColumns(tableForm, node.columns);
    });

    for (let i = erTables.length - 1; i >= 0; i--) {
      const tableName = erTables.at(i).get('tableName')?.value;

      const exists = nodes.some((n: any) => n.key === tableName);

      if (!exists) {
        erTables.removeAt(i);
      }
    }
  }

  /**
   * Sincroniza as colunas de uma tabela do formulário de ER com as colunas do diagrama
   */
  private syncColumns(tableForm: any, diagramColumns: any[]) {
    const formArray = tableForm.get('tableColumnsFormArray') as FormArray;
    const existing = formArray.value;

    const selected = [
      ...(tableForm.get('tableColumnsList')?.value || []),
      ...(tableForm.get('tableColumnsFilter')?.value || [])
    ];;

    formArray.clear();

    selected.forEach((colName: string) => {
      const existsInDiagram = diagramColumns.some((c: any) => c.name === colName);
      if (!existsInDiagram) return;

      const old = existing.find((c: any) => c.databaseColumn === colName);
      formArray.push(
        this.formBuilder.group({
          databaseColumn: [colName],
          displayName: [old?.displayName || this.formatLabel(colName)]
        })
      );
    });

    const newOptions = diagramColumns.map((c: any) => ({
      label: c.name,
      value: c.name
    }));

    tableForm.get('columnsOptions')?.setValue(newOptions, { emitEvent: false });
  }

  private buildErTablesFromSql(nodes: any[]) {
    const formArray = this.resourceForm.get('erTables') as FormArray;
    formArray.clear();

    nodes.forEach((table) => {

      const columnsOptions = table.columns.map((c: any) => ({
        label: c.name,
        value: c.name
      }));

      const group = this.formBuilder.group({
        tableName: [table.key],
        entityName: [table.key],
        isServerSide: [false],
        hasTceBase: [true],
        hasApiVersion: [false],

        tableColumnsList: [[]],
        tableColumnsFilter: [[]],

        columnsOptions: [columnsOptions],

        tableColumnsFormArray: this.formBuilder.array([])
      });

      this.bindTableColumnSync(group);

      formArray.push(group);
    });
  }

  private bindTableColumnSync(tableGroup: FormGroup) {
    tableGroup.get('tableColumnsFilter')?.valueChanges.subscribe(() => {
      this.updateTableColumnsFormArrayFromGroup(tableGroup);
    });

    tableGroup.get('tableColumnsList')?.valueChanges.subscribe(() => {
      this.updateTableColumnsFormArrayFromGroup(tableGroup);
    });
  }

  private updateTableColumnsFormArrayFromGroup(group: FormGroup) {
    const filterColumns = group.get('tableColumnsFilter')?.value || [];
    const listColumns = group.get('tableColumnsList')?.value || [];

    const allSelected = Array.from(new Set([...filterColumns, ...listColumns]));

    const formArray = group.get('tableColumnsFormArray') as FormArray;
    formArray.clear();

    allSelected.forEach((column: string) => {
      formArray.push(
        this.formBuilder.group({
          databaseColumn: [column],
          displayName: [this.formatLabel(column)]
        })
      );
    });
  }

  /**
   * Atualizar formulário baseado no script SQL
   */
  processSql() {
    if (!this.resourceForm.get('sqlScript')?.value) return;

    const result = this.service.parseSqlToDiagram(this.resourceForm.get('sqlScript')?.value);

    this.buildErTablesFromSql(result.nodes);

    this.isSqlStructureUpdated = true;
  }

  /**
  * Salvar modelo em formato json ou sql
  */
  async saveDiagram() {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: 'modelo-relacional',
        types: [
          {
            description: 'Arquivo JSON',
            accept: {
              'application/json': ['.json']
            }
          },
          {
            description: 'Script SQL',
            accept: {
              'application/sql': ['.sql']
            }
          }
        ]
      });

      const fileName = handle.name.toLowerCase();
      let content = '';

      if (fileName.endsWith('.json')) {
        content = this.diagram.model.toJson();

      } else if (fileName.endsWith('.sql')) {
        const model = this.diagram.model as go.GraphLinksModel;

        const payload: GenerateSqlRequest = {
          tables: model.nodeDataArray as TableDto[],
          links: model.linkDataArray as LinkDto[]
        };

        content = this.service.generateSql(payload);
      } else {
        await this.alert.warning('Atenção!', 'Formato de arquivo inválido.');
        return;
      }

      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      await this.alert.success('Sucesso!', 'Arquivo salvo com sucesso.');
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Abrir e carregar diagrama em formato json
  */
  openDiagram(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const json = e.target.result;

      const model = go.Model.fromJson(json) as go.GraphLinksModel;

      model.linkFromPortIdProperty = "fromColumn";
      model.linkToPortIdProperty = "toColumn";

      this.diagram.model = model;
    };

    reader.readAsText(file);
  }

  /**
  * Delega se o arquivo é .json ou .sql
  */
async openArquivo(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      switch (extension) {
        case 'json':
          await this.openDiagram(event);
          break;
        case 'sql':
          await this.importSql(event);
          break;
        default:
          await this.alert.warning(
            'Formato inválido',
            'Selecione um arquivo .json ou .sql'
          );
          break;
      }
    } finally {
      event.target.value = null;
    }
  }

  /**
  * Valida diagrama
  */
  validateModel(): string[] {
    const model = this.diagram.model as go.GraphLinksModel;

    return this.validateDiagramModel(
      model.nodeDataArray as TableDto[],
      model.linkDataArray as LinkDto[]
    );
  }

  /**
  * Valida Sql
  */
  validateSqlModel(script: string): string[] {
    const result = this.service.parseSqlToDiagram(script);

    return this.validateDiagramModel(
      result.nodes,
      result.links
    );
  }

  /**
  * Valida para identificar se possui erros antes de gerar
  */
  validateDiagramModel(nodes: TableDto[], links: LinkDto[]): string[] {
    const errors: string[] = [];

    nodes.forEach((table: any, tableIndex: number) => {
      if (!table.key?.trim()) {
        errors.push(`Existe tabela sem nome.`);
      }

      const duplicatedTable = nodes.some((t: any, i: number) =>
        i !== tableIndex &&
        t.key?.trim()?.toLowerCase() === table.key?.trim()?.toLowerCase()
      );

      if (duplicatedTable) {
        errors.push(`A tabela '${table.key}' está duplicada.`);
      }

      const columns = table.columns || [];
      columns.forEach((column: any, index: number) => {

        if (!column.name?.trim()) {
          errors.push(`A tabela '${table.key}' possui coluna sem nome.`);
        }

        if (!column.type?.trim()) {
          errors.push(`A coluna '${table.key}.${column.name}' está sem tipo.`);
        }

        const isValidType = SqlTypes.some(r => r.test(column.type.trim()));

        if (!isValidType) {
          errors.push(`Tipo inválido '${column.type}' em '${table.key}.${column.name}'.`);
        }

        const duplicated = columns.some((c: any, i: number) =>
          i !== index &&
          c.name?.trim()?.toLowerCase() === column.name?.trim()?.toLowerCase()
        );

        if (duplicated) {
          errors.push(`A tabela '${table.key}' possui coluna duplicada '${column.name}'.`);
        }

        if (column.fk) {
          const hasReference = links.some((l: any) => l.from === table.key && l.fromColumn === column.name);

          if (!hasReference) {
            errors.push(`A FK '${table.key}.${column.name}' não possui referência.`);
          }
        }

        const hasLinkWithoutFk = links.some((l: any) => l.from === table.key && l.fromColumn === column.name);

        if (hasLinkWithoutFk && !column.fk) {
          errors.push(`A coluna '${table.key}.${column.name}' possui relacionamento mas não está marcada como FK.`);
        }
      });
    });

    return [...new Set(errors)];
  }

  /**
   * Salvar workspace atual da geração de arquivos
   */
  async salvarWorkspaceGeracao(): Promise<void> {
    const pathFormValues = this.pathForm.getRawValue();
    const connectionFormValues = this.connectionForm.getRawValue();

    let arquivo: GenerateWorkspaceType;

    if (this.erEditor || this.sqlEditor) {

      let validationErrors: string[] = [];

      if (this.erEditor) {
        validationErrors = this.validateModel();
      } else {
        const sql = this.resourceForm.get('sqlScript')?.value?.trim();

        if (!sql) {
          await this.alert.warning(
            'Atenção!',
            'Nenhum script SQL encontrado para salvar.'
          );

          return;
        }

        validationErrors = this.validateSqlModel(sql);
      }

      if (validationErrors.length > 0) {
        await this.alert.errorHtml('Erros de validação!', validationErrors.join('<br>'));

        return;
      }

      const erTables = this.resourceForm.get('erTables')?.value || [];

      const tables = erTables.map((table: any) => ({
        tableName: table.tableName,
        entityName: table.entityName,
        tableColumnsFilter: table.tableColumnsFilter || [],
        tableColumnsList: table.tableColumnsList || [],
        tableColumnsFormArray: table.tableColumnsFormArray || []
      }));

      const configuration = {
        hasTceBase: this.resourceForm.get('hasTceBase')?.value,
        hasApiVersion: this.resourceForm.get('hasApiVersion')?.value,
        isServerSide: this.resourceForm.get('isServerSide')?.value,
        idConfiguracaoEstrutura: pathFormValues.idConfiguracaoEstrutura,
        projectApiPath: pathFormValues.projectApiPath,
        projectClientPath: pathFormValues.projectClientPath
      };

      if (this.erEditor) {

        const model = this.diagram.model as go.GraphLinksModel;

        arquivo = {
          mode: 'er',

          configuration,

          connectionFilter: {
            servidor: connectionFormValues.servidor,
            porta: connectionFormValues.porta,
            usuario: connectionFormValues.usuario,
            senha: connectionFormValues.senha,
            baseDados: connectionFormValues.baseDados,
          },

          erMode: {
            diagramModel: {
              tables: model.nodeDataArray,
              links: model.linkDataArray
            },
            tables
          }
        };

      } else {

        arquivo = {
          mode: 'sql',

          configuration,

          connectionFilter: {
            servidor: connectionFormValues.servidor,
            porta: connectionFormValues.porta,
            usuario: connectionFormValues.usuario,
            senha: connectionFormValues.senha,
            baseDados: connectionFormValues.baseDados,
          },

          sqlMode: {
            sqlScript: this.resourceForm.get('sqlScript')?.value,
            tables
          }
        };
      }

    } else {

      const form = this.resourceForm.getRawValue();

      arquivo = {
        mode: 'database',

        configuration: {
          hasTceBase: this.resourceForm.get('hasTceBase')?.value,
          hasApiVersion: this.resourceForm.get('hasApiVersion')?.value,
          isServerSide: this.resourceForm.get('isServerSide')?.value,
          idConfiguracaoEstrutura: pathFormValues.idConfiguracaoEstrutura,
          projectApiPath: pathFormValues.projectApiPath,
          projectClientPath: pathFormValues.projectClientPath
        },

        connectionFilter: {
          servidor: connectionFormValues.servidor,
          porta: connectionFormValues.porta,
          usuario: connectionFormValues.usuario,
          senha: connectionFormValues.senha,
          baseDados: connectionFormValues.baseDados,
        },

        databaseMode: {
          tableName: form.tableName,
          entityName: form.entityName,
          tableColumnsFilter: form.tableColumnsFilter || [],
          tableColumnsList: form.tableColumnsList || [],
          tableColumnsFormArray: this.tableColumnsFormArray
            .getRawValue()
        }
      };
    }

    const tipoGeracao = this.erEditor
      ? TipoGeracaoEnum.Er
      : this.sqlEditor
        ? TipoGeracaoEnum.Sql
        : TipoGeracaoEnum.Database;

    let nomeTipo;
    switch (tipoGeracao) {
      case TipoGeracaoEnum.Er:
        nomeTipo = 'Modelagem Relacional';
        break;
      case TipoGeracaoEnum.Sql:
        nomeTipo = 'Script SQL';
        break;
      case TipoGeracaoEnum.Database:
        nomeTipo = 'Banco de Dados';
        break;
      default:
        nomeTipo = '';
        break;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const workspace: WorkspaceGeracaoType = {
      idTipoGeracao: tipoGeracao,
      arquivo: JSON.stringify(arquivo),
      nome: `Workspace ${nomeTipo} ${currentUser?.nomePessoaFisica}`
    };

    try {
      if (this.isEditWorkspace && this.idWorkspaceAtual) {
        await this.workspaceService.update(workspace, this.idWorkspaceAtual);
        await this.alert.success('Sucesso!', 'Workspace atualizado com sucesso.');
      } else {
        await this.workspaceService.save(workspace);
        await this.alert.success('Sucesso!', 'Workspace salvo com sucesso.');
      }
    } catch (error) {
      await this.alert.error('Erro!', 'Erro ao salvar workspace.');
    }
  }

  /**
   * Abre o modal para selecionar um workspace de geração salvo
   */
  async openModalWorkspaceGeracao(stepper: MatStepper): Promise<void> {
    this.modalRef = this.bsModalService.show(
      WorkspaceModalComponent,
      {
        class: 'modal-dialog modal-dialog-centered modal-xl',
        focus: true,
        backdrop: 'static',
        keyboard: true,
      }
    );

    this.modalRef?.content?.workspaceSelecionado.subscribe(
      async (workspace: WorkspaceGeracaoType) => {
        if (!workspace?.arquivo) return;

        this.isEditWorkspace = true;
        this.idWorkspaceAtual = workspace.idWorkspaceGeracao;
        const arquivo = JSON.parse(workspace.arquivo) as GenerateWorkspaceType;

        if (arquivo.connectionFilter) {
          this.connectionForm.patchValue({
            baseDados: arquivo.connectionFilter.baseDados,
            usuario: arquivo.connectionFilter.usuario,
            senha: arquivo.connectionFilter.senha,
            servidor: arquivo.connectionFilter.servidor,
            porta: arquivo.connectionFilter.porta
          });

          await this.submitConnectionForm();
        }

        if (!this.connectionCompleted) return;

        stepper.next();

        if (arquivo.configuration) {
          this.pathForm.patchValue({
            idConfiguracaoEstrutura: arquivo.configuration.idConfiguracaoEstrutura,
            projectApiPath: arquivo.configuration.projectApiPath,
            projectClientPath: arquivo.configuration.projectClientPath
          });

          await this.submitPathForm();
        }

        if (!this.pathCompleted) return;

        stepper.next();

        if (arquivo.mode === 'database' && arquivo.databaseMode) {
          this.erEditor = false;
          this.sqlEditor = false;

          this.resourceForm.patchValue({
            tableName: arquivo.databaseMode.tableName,
            entityName: arquivo.databaseMode.entityName,
            tableColumnsFilter: arquivo.databaseMode.tableColumnsFilter,
            tableColumnsList: arquivo.databaseMode.tableColumnsList,
            hasTceBase: arquivo.configuration.hasTceBase,
            hasApiVersion: arquivo.configuration.hasApiVersion,
            isServerSide: arquivo.configuration.isServerSide
          });

          this.resourceForm.get('tableName')?.setValidators([Validators.required]);
          this.resourceForm.get('entityName')?.setValidators([Validators.required]);
          this.resourceForm.get('tableColumnsList')?.setValidators([Validators.required]);

          this.resourceForm.get('tableName')?.updateValueAndValidity();
          this.resourceForm.get('entityName')?.updateValueAndValidity();
          this.resourceForm.get('tableColumnsList')?.updateValueAndValidity();
        }

        else if (arquivo.mode === 'er' && arquivo.erMode) {

          this.service.setErModel({
            tables: arquivo.erMode.diagramModel.tables,
            links: arquivo.erMode.diagramModel.links
          });

          this.erEditor = true;
          this.sqlEditor = false;

          this.resourceForm.patchValue({
            hasTceBase: arquivo.configuration.hasTceBase,
            hasApiVersion: arquivo.configuration.hasApiVersion,
            isServerSide: arquivo.configuration.isServerSide
          });

          await this.waitAndInitDiagram({
            tables: arquivo.erMode?.diagramModel.tables,
            links: arquivo.erMode?.diagramModel.links
          });
          this.buildWorkspaceErTables(
            arquivo.erMode?.tables || [],
            arquivo.erMode.diagramModel.tables
          );

          this.resourceForm.get('tableName')?.clearValidators();
          this.resourceForm.get('entityName')?.clearValidators();
          this.resourceForm.get('tableColumnsList')?.clearValidators();

          this.resourceForm.get('tableName')?.updateValueAndValidity();
          this.resourceForm.get('entityName')?.updateValueAndValidity();
          this.resourceForm.get('tableColumnsList')?.updateValueAndValidity();
        }

        else if (arquivo.mode === 'sql' && arquivo.sqlMode) {

          this.service.setSqlScript(arquivo.sqlMode.sqlScript);

          this.erEditor = false;
          this.sqlEditor = true;

          this.resourceForm.patchValue({
            sqlScript: arquivo.sqlMode.sqlScript,
            hasTceBase: arquivo.configuration.hasTceBase,
            hasApiVersion: arquivo.configuration.hasApiVersion,
            isServerSide: arquivo.configuration.isServerSide
          });

          this.isSqlStructureUpdated = true;

          const result = this.service.parseSqlToDiagram(
            arquivo.sqlMode.sqlScript
          );

          this.buildWorkspaceErTables(
            arquivo.sqlMode.tables,
            result.nodes
          );

          this.resourceForm.get('tableName')?.clearValidators();
          this.resourceForm.get('entityName')?.clearValidators();
          this.resourceForm.get('tableColumnsList')?.clearValidators();

          this.resourceForm.get('tableName')?.updateValueAndValidity();
          this.resourceForm.get('entityName')?.updateValueAndValidity();
          this.resourceForm.get('tableColumnsList')?.updateValueAndValidity();
        }
      }
    );
  }

  /**
   * Constrói tabelas do formulário de ER com base nas tabelas do workspace e nos nós do diagrama para manter as opções de colunas atualizadas
   */ 
  private buildWorkspaceErTables(workspaceTables: any[], nodes?: any[]): void {

    const erTables = this.resourceForm.get('erTables') as FormArray;

    erTables.clear();

    workspaceTables.forEach((table: any) => {

      const columns =
        nodes?.find((n: any) => n.key === table.tableName)?.columns || [];

      const columnsOptions = columns.map((c: any) => ({
        label: c.name,
        value: c.name
      }));

      const tableColumnsFormArray = this.formBuilder.array(
        (table.tableColumnsFormArray || []).map((column: any) =>
          this.formBuilder.group({
            databaseColumn: [column.databaseColumn],
            displayName: [column.displayName]
          })
        )
      );

      erTables.push(
        this.formBuilder.group({
          tableName: [table.tableName],
          entityName: [table.entityName],
          tableColumnsFilter: [table.tableColumnsFilter || []],
          tableColumnsList: [table.tableColumnsList || []],
          columnsOptions: [columnsOptions],
          tableColumnsFormArray
        })
      );
    });
  }

  /**
   * Renderiza diagrama após garantir que o elemento HTML esteja disponível
   */
  private waitAndInitDiagram(model: any, attempts = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      const tryInit = () => {
        const div = document.getElementById('diagramDiv');

        if (!div) {
          if (attempts >= 20) {
            reject('diagramDiv não encontrada.');
            return;
          }

          attempts++;
          setTimeout(tryInit, 100);
          return;
        }

        if (!this.diagram) {
          this.initDiagram();
        }

        this.applyModel(model);
        resolve();
      };

      tryInit();
    });
  }
}
