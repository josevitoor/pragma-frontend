import { Injectable, Injector } from '@angular/core';
import { BaseService, ConfigService } from 'tce-ng-lib';
import { GenerateFilterType } from '../models/GenerateFilterType';
import { ColumnDto, GenerateSqlRequest, LinkDto, TableDto } from '../models/GenerateSqlType';
import { BehaviorSubject } from 'rxjs';
import { GenerateBatchFilterType } from '../models/GenerateBatchFilterType';

@Injectable({
  providedIn: 'root',
})
export class GenerateService extends BaseService<GenerateFilterType> {
  private readonly BASE_URL = `${ConfigService.getEnv().apiSistema}/Generate`;

  private erModelSubject = new BehaviorSubject<any>(null);
  erModel$ = this.erModelSubject.asObservable();

  private sqlScriptSubject = new BehaviorSubject<string | null>(null);
  sqlScript$ = this.sqlScriptSubject.asObservable();

  constructor(injector: Injector) {
    super(injector, `${ConfigService.getEnv().apiSistema}/Generate`);
  }

  /**
   * Gera os arquivos de código CRUD
   */
  generateCrudFiles(data: GenerateBatchFilterType): Promise<void> {
    return this.http
      .post<void>(`${this.BASE_URL}/generate-files`, data)
      .toPromise();
  }

  /**
   * Gera o script SQL para criação do banco de dados
   */
  generateSql(generateSql: GenerateSqlRequest): string {
    let sql = '';

    generateSql.tables.forEach((table: any) => {

      sql += `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${table.key}')\n`;
      sql += `BEGIN\n`;
      sql += `  CREATE TABLE ${table.key} (\n`;

      const pkColumns = table.columns.filter((c: any) => c.pk).map((c: any) => c.name);

      const colsSql = table.columns.map((col: any) => {

        let line = `    ${col.name} ${col.type}`;

        if (col.nn || col.pk) line += ' NOT NULL';
        else line += ' NULL';

        if (col.ai) line += ' IDENTITY(1,1)';
        if (col.uq) line += ' UNIQUE';

        return line;
      });

      sql += colsSql.join(',\n');

      if (pkColumns.length > 0) {
        sql += `,\n    CONSTRAINT PK_${table.key} PRIMARY KEY (${pkColumns.join(', ')})`;
      }

      sql += `\n  )\nEND;\n\n`;
    });


    generateSql.links.forEach((link: any) => {

      sql += `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_NAME = 'FK_${link.from}_${link.to}')\n`;

      sql += `BEGIN\n`;
      sql += `  ALTER TABLE ${link.from}\n`;
      sql += `  ADD CONSTRAINT FK_${link.from}_${link.to}\n`;
      sql += `  FOREIGN KEY (${link.fromColumn}) REFERENCES ${link.to}(${link.toColumn});\n`;
      sql += `END;\n\n`;
    });

    return sql;
  }

  /**
  * Realiza o parsing de um script SQL para extrair as tabelas, colunas e relacionamentos, retornando no formato esperado pelo diagrama ER
  */
  parseSqlToDiagram(sql: string) {
    const nodes: TableDto[] = [];
    const links: LinkDto[] = [];

    const cleanSql = sql
      .replace(/IF\s+NOT\s+EXISTS[\s\S]*?BEGIN/gi, '')
      .replace(/END;/gi, '');

    const tables = this.extractTables(cleanSql);

    tables.forEach(t => {

      const tableName = t.name;
      const body = t.body
        .replace(/\r/g, '')
        .replace(/\n\s+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const columns: ColumnDto[] = [];

      const pkCols: string[] = [];
      const pkRegex = /PRIMARY KEY\s*\((.*?)\)/gi;

      let pkMatch;
      while ((pkMatch = pkRegex.exec(body)) !== null) {
        const cols = pkMatch[1]
          .split(',')
          .map((c: string) => c.trim());

        pkCols.push(...cols);
      }

      const parts = body
        .split(/,(?![^(]*\))/g)
        .map(p => p.trim())
        .filter(Boolean);

      parts.forEach(part => {

        if (/^CONSTRAINT\s+/i.test(part) || /^PRIMARY KEY/i.test(part) || /^FOREIGN KEY/i.test(part)) {
          return;
        }

        const match = part.match(/^(\w+)\s+([a-zA-Z0-9]+(?:\([^)]+\))?)(.*)$/i);

        if (!match) return;

        const name = match[1];
        const type = match[2];
        const rest = match[3].toUpperCase();

        const isPk = pkCols.includes(name);

        columns.push({
          name,
          type,
          pk: isPk,
          fk: false,
          nn: rest.includes("NOT NULL"),
          uq: rest.includes("UNIQUE"),
          ai: rest.includes("IDENTITY")
        });
      });

      nodes.push({
        key: tableName,
        columns
      });
    });

    const fkRegex = /ALTER TABLE\s+(\w+)[\s\S]*?FOREIGN KEY\s*\((.*?)\)\s*REFERENCES\s+(\w+)\s*\((.*?)\)/gi;

    let fkMatch;

    while ((fkMatch = fkRegex.exec(cleanSql)) !== null) {

      const fromTable = fkMatch[1];
      const fromColumns = fkMatch[2].split(',').map((c: string) => c.trim());
      const toTable = fkMatch[3];
      const toColumns = fkMatch[4].split(',').map((c: string) => c.trim());

      fromColumns.forEach((fromColumn, index) => {
        const toColumn = toColumns[index];
        if (!toColumn) return;

        links.push({
          from: fromTable,
          to: toTable,
          fromColumn,
          toColumn
        });

        const table = nodes.find(t => t.key === fromTable);

        const col = table?.columns.find(c => c.name === fromColumn);

        if (col) {
          col.fk = true;
        }
      });
    }

    return { nodes, links };
  }

  /**
  * Extrai as tabelas de um script SQL
  */
  private extractTables(sql: string) {
    const tables: { name: string, body: string }[] = [];

    const regex = /CREATE TABLE\s+([\w.\[\]]+)/gi;
    let match;

    while ((match = regex.exec(sql)) !== null) {

      const fullName = match[1];
      const tableName = fullName
        .replace(/[\[\]]/g, '')
        .split('.')
        .pop();
      const startIndex = match.index + match[0].length;

      const openParenIndex = sql.indexOf("(", startIndex);

      let index = openParenIndex + 1;
      let level = 1;

      while (level > 0 && index < sql.length) {
        if (sql[index] === "(") level++;
        if (sql[index] === ")") level--;
        index++;
      }

      const body = sql.substring(openParenIndex + 1, index - 1);

      tables.push({
        name: tableName!,
        body
      });
    }

    return tables;
  }

  /**
  * Define o modelo ER atual para ser utilizado na modelagem e geração de SQL
  */
  setErModel(model: any) {
    this.erModelSubject.next(model);
  }

  /**
  * Retorna o modelo ER atual para ser utilizado na modelagem e geração de SQL
  */
  getErModel() {
    return this.erModelSubject.value;
  }

  /**
  * Define o SQL para ser utilizado na geração de código
  */
  setSqlScript(sql: string) {
    this.sqlScriptSubject.next(sql);
  }

  /**
  * Retorna o SQL para ser utilizado na geração de código
  */
  getSqlScript(): string | null {
    return this.sqlScriptSubject.value;
  }
}
