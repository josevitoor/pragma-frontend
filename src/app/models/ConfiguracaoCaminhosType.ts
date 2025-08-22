import { ConfiguracaoEstruturaProjetoType } from './ConfiguracaoEstruturaProjetoType';

export interface ConfiguracaoCaminhosType {
  idConfiguracaoCaminho: number;
  idConfiguracaoEstrutura: number;
  caminhoApi: string;
  caminhoCliente: string;
  dataInclusao: Date;
  idOperadorInclusao: number;
  configuracaoEstruturaProjeto: ConfiguracaoEstruturaProjetoType;
}
