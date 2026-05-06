import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { GenerateFilterType } from 'src/app/models/GenerateFilterType';
import { GenerateService } from 'src/app/services/generate.service';
import { BaseResourceFormComponent } from 'tce-ng-lib';

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
    private formBuilder: FormBuilder
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

      if (!sql) return;

      this.service.setSqlScript(sql);

      this.router.navigate(['/dashboard/gerador/gerar-codigo'], {
        queryParams: { sqlEditor: true }
      });
    }
  }
