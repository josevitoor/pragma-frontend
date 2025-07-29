export type ConfiguracaoGeracaoType = {
  idConfiguracao: number;
  baseDados: string;
  usuario: string;
  senha: string;
  servidor: string;
  porta: number;
  caminhoApi: string;
  caminhoCliente: string;
  caminhoArquivoRota: string;
  dataInclusao: Date;
  idOperadorInclusao: number;
  idSessao: number;
};
