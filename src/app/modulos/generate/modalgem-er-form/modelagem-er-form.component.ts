import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { GenerateFilterType } from 'src/app/models/GenerateFilterType';
import { GenerateService } from 'src/app/services/generate.service';
import { BaseResourceFormComponent } from 'tce-ng-lib';
import * as go from 'gojs';
import { links, nodes } from 'src/app/constants/InitialModel';
import { GenerateSqlRequest, LinkDto, TableDto } from 'src/app/models/GenerateSqlType';

@Component({
  selector: 'pragma-modelagem-er-form',
  templateUrl: './modelagem-er-form.component.html',
  styleUrls: ['./modelagem-er-form.component.css'],
})
export class ModelagemErFormComponent
  extends BaseResourceFormComponent<GenerateFilterType>
  implements OnInit
{
  service: GenerateService;

  diagram!: go.Diagram;
  nodes = nodes;
  links = links;

  sqlGerado: string | null = null;
  @ViewChild('sqlSection') sqlSection!: ElementRef;

  constructor(
    protected injector: Injector,
    private formBuilder: FormBuilder
  ) {
    super(new GenerateService(injector));
    this.service = injector.get(GenerateService);
    
    this.resourceForm = this.formBuilder.group({
      tableColumnsList: [{ value: [], disabled: true }, Validators.required],
      tableColumnsFormArray: this.formBuilder.array([]),
      erTables: this.formBuilder.array([]) 
    });
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initDiagram();
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
                  $(go.TextBlock, new go.Binding("text", "pk", v => v ? "PK" : "-"))
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
                  $(go.TextBlock, new go.Binding("text", "fk", v => v ? "FK" : "-"))
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
                  $(go.TextBlock, new go.Binding("text", "nn", v => v ? "NN" : "-"))
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
                  $(go.TextBlock, new go.Binding("text", "uq", v => v ? "UQ" : "-"))
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
                  $(go.TextBlock, new go.Binding("text", "ai", v => v ? "AI" : "-"))
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
        { name: 'Id', type: 'int', pk: true, fk: false, nn: true, uq: false, ai: true }
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

    erTables.push(group);
  }

  /**
   * Gera o script SQL com base no modelo do diagrama
   */
  async gerarSqlPreview() {
    const model = this.diagram.model as go.GraphLinksModel;

    const payload: GenerateSqlRequest = {
      tables: model.nodeDataArray as TableDto[],
      links: model.linkDataArray as LinkDto[]
    };

    this.sqlGerado = this.service.generateSql(payload);

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

    this.diagram.model = new go.GraphLinksModel(this.nodes, this.links);
  }

  /**
  * Copia o script SQL gerado para a área de transferência do usuário.
  */
  copiarSql() {
    if (!this.sqlGerado) return;

    navigator.clipboard.writeText(this.sqlGerado)
      .then(() => {
      })
      .catch(() => {
      });
  }
}
