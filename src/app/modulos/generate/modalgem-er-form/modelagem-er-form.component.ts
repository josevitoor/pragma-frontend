import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { GenerateFilterType } from 'src/app/models/GenerateFilterType';
import { GenerateService } from 'src/app/services/generate.service';
import { AlertsService, BaseResourceFormComponent } from 'tce-ng-lib';
import * as go from 'gojs';
import { Links, Nodes } from 'src/app/constants/InitialModel';
import { GenerateSqlRequest, LinkDto, TableDto } from 'src/app/models/GenerateSqlType';
import { FormBuilder } from '@angular/forms';
import { SqlTypes } from 'src/app/constants/SqlTypes';

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
  nodes = Nodes;
  links = Links;

  sqlGerado: string | null = null;
  @ViewChild('sqlSection') sqlSection!: ElementRef;

  constructor(
    protected injector: Injector,
    private formBuilder: FormBuilder,
    private alerts: AlertsService
  ) {
    super(new GenerateService(injector));
    this.service = injector.get(GenerateService);
    
    this.resourceForm = this.formBuilder.group({
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
              editable: true,

              textEdited: (textBlock, oldValue, newValue) => {
                const node = textBlock.part?.data;
                if (!node) return;

                const normalizedName = newValue?.trim();
                if (!normalizedName) {
                  textBlock.text = oldValue;
                  return;
                }

                const model = this.diagram.model as go.GraphLinksModel;
                const duplicated = model.nodeDataArray.some((n: any) =>
                  n !== node &&
                  n.key?.toLowerCase() === normalizedName.toLowerCase()
                );

                if (duplicated) {
                  textBlock.text = oldValue;
                  this.alerts.warning('Atenção!', `Já existe uma tabela com o nome '${normalizedName}'.`);

                  return;
                }

                model.startTransaction("update table name");
                model.setDataProperty(node, "key", normalizedName);

                model.linkDataArray.forEach((link: any) => {
                  if (link.from === oldValue) {
                    model.setDataProperty(link, "from", normalizedName);
                  }
                  if (link.to === oldValue) {
                    model.setDataProperty(link, "to", normalizedName);
                  }
                });

                model.commitTransaction("update table name");
              }
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
    this.diagram.model.addNodeData({
      key: 'TabelaNova',
      columns: [
        { name: 'Id', type: 'INT', pk: true, fk: false, nn: true, uq: false, ai: true }
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

    const model = new go.GraphLinksModel(this.nodes, this.links);
    model.linkFromPortIdProperty = "fromColumn";
    model.linkToPortIdProperty = "toColumn";
    this.diagram.model = model;
  }

  /**
  * Copia o script SQL gerado para a área de transferência do usuário.
  */
  copySql() {
    if (!this.sqlGerado) return;

    navigator.clipboard.writeText(this.sqlGerado);
  }

  /**
  * Navega para a tela de geração de código, passando o modelo do diagrama ER para o serviço e indicando que a origem é o editor de ER por meio de query params.
  */
  goToGeracao() {
    const model = this.diagram.model as go.GraphLinksModel;

    const payload = {
      tables: model.nodeDataArray,
      links: model.linkDataArray
    };

    const errors = this.validateModel();

    if (errors.length > 0) {
      this.alerts.errorHtml('Erros de validação!', errors.join('<br>'));

      return;
    }

    this.service.setErModel(payload);

    this.router.navigate(['/dashboard/gerador/gerar-codigo'], {
      queryParams: { erEditor: true }
    });
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
        await this.alerts.warning('Atenção!', 'Formato de arquivo inválido.');
        return;
      }

      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      await this.alerts.success('Sucesso!', 'Arquivo salvo com sucesso.');
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
          await this.alerts.warning(
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
}
