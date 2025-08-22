export interface ConfiguracaoEstruturaProjetoType {
  idConfiguracaoEstrutura: number;
  nomeEstrutura: string;
  apiDependencyInjectionConfig: string;
  apiConfigureMap: string;
  apiControllers: string;
  apiEntities: string;
  apiMapping: string;
  apiContexts: string;
  apiServices: string;
  apiImportBaseService: string;
  apiImportUOW: string;
  apiImportPaginate: string;
  clientServices: string;
  clientModels: string;
  clientModulos: string;
  dataInclusao: Date;
  idOperadorInclusao: number;
  clientArquivoRotas: string;
}
