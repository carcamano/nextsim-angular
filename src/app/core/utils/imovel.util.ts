import {Imovel} from "../../imoveis/models/imovel.model";


export const toArea = (imovel: Imovel) => {
  if (imovel) {
    try {
      if (imovel && imovel.tipo === 'casa') {
        return imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      } else if (imovel && imovel.tipo === 'apartamento' || imovel.tipo === 'sala' || imovel.tipo === 'cobertura') {
        return imovel.numeros.areas.util.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      } else if (imovel && imovel.tipo === 'terreno') {
        return imovel.numeros.areas.total.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      } else if (imovel && imovel.tipo === 'chácara') {
        return imovel.numeros.areas.terreno.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      } else if (imovel && imovel.tipo === 'galpão') {
        return imovel.numeros.areas.construida.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      } else if (imovel && imovel.tipo === 'prédio') {
        return imovel.numeros.areas.construida.toFixed(0) + ' ' + imovel.numeros.areas.unidade;
      }
    } catch (e) {
      // console.error(e);
    }
  }
  return null;
}

export const toDormis = (imovel: Imovel) =>  {
  if (!imovel) {
    return '?';
  }
  try {
    if (imovel && imovel.finalidade === 'residencial') {
      return imovel.numeros.dormitorios;
    } else if (imovel) {
      return imovel.numeros.salas;
    }
  } catch (e) {
    // console.error(e);
  }
  return '?';
}

export const toSalas = (imovel: Imovel) =>  {
  if (!imovel) {
    return '?';
  }
  try {
    if (imovel && (imovel.tipo === 'sala' || imovel.tipo === 'prédio')) {
      return imovel.numeros.salas;
    } else if (imovel) {
      return imovel.numeros.salas;
    }
  } catch (e) {
    // console.error(e);
  }
  return '?';
}

export const getprice = (imovel: Imovel, queryParams: any): string =>  {
  if (!imovel) {
    return '?';
  }
  try {
    if (queryParams.categoria === 'comprar') {
      if (imovel.comercializacao.venda && imovel.comercializacao.venda.ativa) {
        return getFormattedPrice(imovel.comercializacao.venda.preco);
      }
    } else if (queryParams.categoria === 'alugar') {
      if (imovel.comercializacao.locacao && imovel.comercializacao.locacao.ativa) {
        return getFormattedPrice(imovel.comercializacao.locacao.preco);
      }
    } else {
      if (imovel.comercializacao.locacao && imovel.comercializacao.locacao.ativa) {
        return getFormattedPrice(imovel.comercializacao.locacao.preco);
      } else if (imovel.comercializacao.venda && imovel.comercializacao.venda.ativa) {
        return getFormattedPrice(imovel.comercializacao.venda.preco);
      }
    }
  } catch (e) {
    // console.error(e);
  }
  return '?';
}

export const getFormattedPrice = (price: number, sale = false): string =>  {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price).replace(',00', '') + (sale ? '' : '<sub>/mês</sub>');
}
