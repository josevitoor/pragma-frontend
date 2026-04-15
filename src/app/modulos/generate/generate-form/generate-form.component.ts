import { Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { links, nodes } from 'src/app/constants/InitialModel';

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

  modalRef!: BsModalRef;

  diagram!: go.Diagram;
  nodes = nodes;
  links = links;

  constructor(
    protected injector: Injector,
    private formBuilder: FormBuilder,
    private informationService: InformationService,
    private caminhosService: ConfiguracaoCaminhosService,
    private bsModalService: BsModalService,
    private alert: AlertsService,
    private configEstrutura: ConfiguracaoEstruturaProjetoService
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
      tableName: [null, [Validators.required]],
      entityName: [null, [Validators.required]],
      tableColumnsFilter: [{ value: [], disabled: true }],
      isServerSide: [false],
      hasTceBase: [true],
      hasApiVersion: [false],
      tableColumnsList: [{ value: [], disabled: true }, Validators.required],
      tableColumnsFormArray: this.formBuilder.array([]),
      erEditor: [false],
      erTables: this.formBuilder.array([]) 
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

    this.configuracoesEstruturas = await this.configEstrutura.getAll().then();

    this.resourceForm.get('erEditor')?.valueChanges.subscribe(value => {
      if (value) {
        this.resourceForm.get('tableName')?.clearValidators();
        this.resourceForm.get('entityName')?.clearValidators();
        this.resourceForm.get('tableColumnsList')?.clearValidators();

        this.resourceForm.get('tableName')?.updateValueAndValidity();
        this.resourceForm.get('entityName')?.updateValueAndValidity();
        this.resourceForm.get('tableColumnsList')?.updateValueAndValidity();

        setTimeout(() => {
          this.initDiagram();
          this.buildErTables();
        }, 0);
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
  async submitPathForm(stepper: MatStepper) {
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
      stepper.next();
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

    const generateFormValues = this.resourceForm.getRawValue();
    const pathFormValues = this.pathForm.getRawValue();
    const connectionFormValues = this.connectionForm.getRawValue();

    const generateData: GenerateFilterType = {
      tableName: generateFormValues.tableName,
      entityName: generateFormValues.entityName,
      isServerSide: generateFormValues.isServerSide,
      hasTceBase: generateFormValues.hasTceBase,
      hasApiVersion: generateFormValues.hasApiVersion,
      tableColumnsFilter: generateFormValues.tableColumnsFilter,
      generateBackendFilter: {
        projectApiPath: pathFormValues.projectApiPath,
      },
      idConfiguracaoEstrutura: pathFormValues.idConfiguracaoEstrutura,
      generateFrontendFilter: {
        projectClientPath: pathFormValues.projectClientPath,
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
      this.alert.error(
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

  buildErTables() {
    const nodes = this.diagram.model.nodeDataArray;
    const erTables = this.resourceForm.get('erTables') as FormArray;

    erTables.clear();

    nodes.forEach((table: any, index: number) => {

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
        this.updateErTableColumnsFormArray(index);
      });

      group.get('tableColumnsFilter')?.valueChanges.subscribe(() => {
        this.updateErTableColumnsFormArray(index);
      });

      erTables.push(group);
    });
  }

  updateErTableColumnsFormArray(index: number) {
    const erTables = this.resourceForm.get('erTables') as FormArray;
    const tableGroup = erTables.at(index);

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
          databaseColumn: [{ value: column, disabled: true }],
          displayName: [this.formatLabel(column)]
        })
      );
    });
  }

  getColumnsFromEr(index: number) {
    const table = (this.resourceForm.get('erTables') as FormArray).at(index);

    const cols = table.get('tableColumnsFormArray')?.value || [];

    return cols.map((c: any) => ({
      label: c.databaseColumn,
      value: c.databaseColumn
    }));
  }

  /**
   * Inicializa o diagrama de ER utilizando a biblioteca GoJS
   */
  initDiagram() {
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
                  cursor: "pointer",
                  portId: ""
                },
                new go.Binding("portId", "name"),
                // Nome da coluna
                $(go.TextBlock,
                  {
                    column: 0,
                    margin: 2,
                    editable: true,
                    width: 110
                  },
                  new go.Binding("text", "name").makeTwoWay(),
                ),

                // Tipo da coluna
                $(go.TextBlock,
                  {
                    column: 1,
                    margin: 2,
                    width: 90,
                    editable: true
                  },
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

                      if (data && item) {
                        this.diagram.model.startTransaction("toggle pk");
                        item.pk = !item.pk;
                        this.diagram.model.updateTargetBindings(data);
                        this.diagram.model.commitTransaction("toggle pk");
                      }
                    }
                  },
                  $(go.TextBlock,
                    new go.Binding("text", "pk", v => v ? "PK" : "-")
                  )
                ),

                // FK
                $("Button",
                  {
                    column: 3,
                    width: 35,
                    click: (e, obj) => {
                      const data = obj.part?.data;
                      const item = obj.panel?.data;

                      if (data && item) {
                        this.diagram.model.startTransaction("toggle fk");
                        item.fk = !item.fk;
                        this.diagram.model.updateTargetBindings(data);
                        this.diagram.model.commitTransaction("toggle fk");
                      }
                    }
                  },
                  $(go.TextBlock,
                    new go.Binding("text", "fk", v => v ? "FK" : "-")
                  )
                ),

                // DELETE
                $("Button",
                  {
                    column: 4,
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
        corner: 5
      },
      $(go.Shape,
        { strokeWidth: 2, stroke: "#555" }
      )
    );

    // Validação para evitar criação de links duplicados e garantir que o destino seja uma PK
    this.diagram.toolManager.linkingTool.linkValidation = (fromNode, fromPort, toNode, toPort) => {
      const model = this.diagram.model as go.GraphLinksModel;
      const links = model.linkDataArray;

      const fromTable = fromNode.data;
      const toTable = toNode.data;

      const fromColumn = fromTable.columns?.find((c: any) => c.name === fromPort.portId);
      const toColumn = toTable.columns?.find((c: any) => c.name === toPort.portId);

      if (!fromColumn || !toColumn) return false;

      if (!toColumn.pk) return false;

      const exists = links.some((l: any) =>
        l.from === fromTable.key &&
        l.to === toTable.key
      );

      if (exists) return false;

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
        const isEr = this.resourceForm.get('erEditor')?.value;
        if (isEr) {
          this.syncErFormWithDiagram();
        }
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
    this.diagram.model.addNodeData({
      key: 'TabelaNova',
      columns: [
        { name: 'Id', type: 'int', pk: true, fk: false }
      ]
    });
  }

  /**
   * Adiciona uma nova coluna a uma tabela existente
   */
  addColumn(node: any) {

    this.diagram.model.startTransaction("add column");

    if (!node.columns) node.columns = [];

    node.columns.push({
      name: "CampoNovo",
      type: "int",
      pk: false,
      fk: false
    });

    this.diagram.model.updateTargetBindings(node);

    this.diagram.model.commitTransaction("add column");
  }

  /**
   * Salvar o diagrama em formato JSON para posterior edição ou geração de arquivos a partir do modelo criado
   */
  exportDiagram() {
    const json = this.diagram.model.toJson();

    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagrama-er.json';
    a.click();

    window.URL.revokeObjectURL(url);
  }

  /**
   * Importa um diagrama em formato JSON
   */
  importDiagram(event: any) {
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
   * Sincroniza o formulário de ER com o modelo do diagrama
   */
  syncErFormWithDiagram() {
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
  syncColumns(tableForm: any, diagramColumns: any[]) {
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
          databaseColumn: [{ value: colName, disabled: true }],
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

  /**
   * Adiciona uma nova tabela ao formulário de ER com base em um nó do diagrama
   */
  addErTable(node: any) {
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

    const index = erTables.length;

    group.get('tableColumnsList')?.valueChanges.subscribe(() => {
      this.updateErTableColumnsFormArray(index);
    });

    group.get('tableColumnsFilter')?.valueChanges.subscribe(() => {
      this.updateErTableColumnsFormArray(index);
    });

    erTables.push(group);
  }
}
