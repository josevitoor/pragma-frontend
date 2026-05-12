import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SqlTypes } from 'src/app/constants/SqlTypes';
import { GenerateFilterType } from 'src/app/models/GenerateFilterType';
import { LinkDto, TableDto } from 'src/app/models/GenerateSqlType';
import { GenerateService } from 'src/app/services/generate.service';
import { AlertsService, BaseResourceFormComponent } from 'tce-ng-lib';

@Component({
  selector: 'pragma-modelagem-sql-form',
  templateUrl: './modelagem-sql-form.component.html',
  styleUrls: ['./modelagem-sql-form.component.css'],
})
export class ModelagemSqlFormComponent
  extends BaseResourceFormComponent<GenerateFilterType>
  implements OnInit
{
  service: GenerateService;

  constructor(
    protected injector: Injector,
    private formBuilder: FormBuilder,
    private alerts: AlertsService
  ) {
    super(new GenerateService(injector));
    this.service = injector.get(GenerateService);
    
    this.resourceForm = this.formBuilder.group({
      sqlScript: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit();
  }

  /**
   * Realiza o download do script SQL
   */
  downloadSql() {
    const sql = this.resourceForm.get('sqlScript')?.value;
    if (!sql) return;

    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.sql';
    a.click();

    window.URL.revokeObjectURL(url);
  }

  /**
  * Importa um script SQL
  */
  async importSql(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();

    this.resourceForm.get('sqlScript')?.setValue(text);
  }

  /**
  * Copia o script SQL gerado para a área de transferência do usuário.
  */
  copySql() {
    const sql = this.resourceForm.get('sqlScript')?.value;
    if (!sql) return;

    navigator.clipboard.writeText(sql);
  }

  /**
  * Navega para a tela de geração de código, passando o Sql atual
  */
  goToGeracao() {
    const sql = this.resourceForm.get('sqlScript')?.value;

    if (!sql) {
      this.alerts.warning('Atenção!', "Nenhum script SQL encontrado para geração.");
      return; 
    }

    const errors = this.validateSqlModel(sql);

    if (errors.length > 0) {
      this.alerts.warning('Erros de validação!', errors.join('<br>'));

      return;
    }

    this.service.setSqlScript(sql);

    this.router.navigate(['/dashboard/gerador/gerar-codigo'], {
      queryParams: { sqlEditor: true }
    });
  }

  /**
  * Valida script Sql
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

    nodes.forEach((table: any) => {
      if (!table.key?.trim()) {
        errors.push(`Existe tabela sem nome.`);
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
      });
    });

    return [...new Set(errors)];
  }
}
