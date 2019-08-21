export interface Imovel {
  sigla: string;
  tipo: string;
  local: Local;
  comercializacao: Comercializacao;
  numeros: Numeros;
  detalhes: Detalhes;
  recursos: Recursos;
  midia: {
    imagens: [string],
    fotoscond: [string]
  };
}

export interface Recursos {
  imovel: [string];
  condominio: [string];
}

export interface Detalhes {
  separacaocasa: string;
  descricaosite: string;
}

export interface Local {
  bairro: string;
  cidade: string;
  cep: string;
  coordenadas: [number];
}


export interface Comercializacao {
  locacao: Locacao;
  financiado: Ativa;
  permuta: Ativa;
  taxa: Taxa;
  venda: Venda;
}

export interface Locacao {
  preco: number;
  ativa: boolean;
  aceitafinanciamento: boolean;
}

export interface Venda {
  preco: number;
  ativa: boolean;
  aceitafinanciamento: boolean;
}

export interface Ativa {
  ativa: boolean;
}

export interface Taxa {
  condominio: number;
  iptu: number;
  mes: string;
}


export interface Numeros {
  vagas: number;
  dormitorios: number;
  salas: number;
  banheiros: number;
  areas: Areas;
}

export interface Areas {
  total: number;
  util: number;
  terreno: number;
  construida: number;
  unidade: string;
}
