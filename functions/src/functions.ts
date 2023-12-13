import {fetch as crossFetch} from "cross-fetch";
import {COLLECTION_AUTOCOMPLETE, COLLECTION_IMOVEIS, COLLECTION_LOCAIS, Imovel} from "./model/model";
import * as admin from "firebase-admin";
import {BigBatch} from '@qualdesk/firestore-big-batch'

export function replaceStrings(string: string): string {
  let s = string ? string.replace('/SP', '') : '';
  return s;
}

export const _get = (obj: any, path: string, defaultValue = undefined) => {
  const travel = (regexp: any) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

export function fetchAllFromAPI(): Promise<Imovel[] | undefined | void> | null {
  return crossFetch('https://turbo.gestaoreal.com.br/exportacao/Imoveis?imob=5796bc63c096d580178b4575').then((value: Response) => {
    return value.json().then((value1: Imovel[]) => {
      return makeImoveis(value1);
    });

  }).catch(reason => {
    console.error(reason);
    return new Promise(resolve => resolve());
  });
}

export function fetchAllFromBackup(filePath: string): Promise<Imovel[] | undefined | void> | null {
  return admin.storage().bucket('next-jsonserver.appspot.com').file(filePath)
    .download()
    .then((data) => {
      return makeImoveis(JSON.parse(data.toString()));
    }).catch(reason => {
      console.error(reason);
      return new Promise(resolve => resolve());
    });
}

export const makeImoveis = (value1: any[]): Imovel[] => {
  let imoveis: Imovel[] = [];
  if (value1.filter) {
    imoveis = value1.filter((imovel, index) => {
      if (imovel && imovel.comercializacao && imovel.comercializacao.locacao && imovel.comercializacao.locacao.ativa) {
        return true;
      } else if (imovel && imovel.comercializacao && imovel.comercializacao.venda && imovel.comercializacao.venda.ativa) {
        return true;
      }
      return false;
    }).map(imovel => {
      return adaptImovel(imovel);
    });
  }
  return imoveis;
}

export function _getAllImoveisFromAPI(): Promise<{ imoveis: Imovel[] | void | undefined } | boolean> | undefined {
  return fetchAllFromAPI()?.then(async imoveis => {
    if (imoveis) {
      for (const imovel of imoveis) {
        await admin.firestore().collection(COLLECTION_IMOVEIS).doc(imovel.sigla).set(imovel).then(value2 => value2);
      }
    }
    return {imoveis};
  }).catch(reason => {
    return false;
  });
}

export function _getAllImoveisFromBackup(filePath: string): Promise<{ imoveis: Imovel[] | void | undefined } | boolean> | undefined {
  return fetchAllFromBackup(filePath)?.then(async imoveis => {
    if (imoveis) {
      for (const imovel of imoveis) {
        await admin.firestore().collection(COLLECTION_IMOVEIS).doc(imovel.sigla).set(imovel).then(value2 => value2);
      }
    }
    return {imoveis};
  }).catch(reason => {
    return false;
  });
}


export function _deleteAllImoveisInDB(): Promise<any> {
  // return Promise.all([
  //     deleteCollection(COLLECTION_IMOVEIS),
  //     deleteCollection(COLLECTION_AUTOCOMPLETE),
  //     deleteCollection(COLLECTION_LOCAIS),
  // ]);

  return clearFirestoreData();
}

export function _getAllFromCollection(path: string): Promise<any[]> {
  return admin.firestore().collection(path).get().then(value => {
    const itens: any[] = [];
    value.forEach((result) => {
      itens.push({...result.data(), documentId: result.id, ref: result.ref});
    });
    return itens;
  });
}

export const _saveAllLocalImoveis = () => {
  return _getAllFromCollection(COLLECTION_IMOVEIS).then(imoveis => {
    const content = JSON.stringify(imoveis)
    return admin.storage().bucket('next-jsonserver.appspot.com').file(`backup/backup-${new Date().getTime()}.json`).save(content).then(value => {
      return {file: value, imoveis: imoveis.length};
    })
  });
};


export async function _makeAutoComplete(imoveis: Imovel[]): Promise<any> {
  var autocomplete: any[] = [];
  if (imoveis?.length > 0) {
    imoveis.forEach((imovel: Imovel) => {
      if (!autocomplete.includes(replaceStrings(imovel.sigla))) {
        autocomplete.push({type: 'sigla', value: replaceStrings(imovel.sigla)});
      }
      if (!autocomplete.includes(replaceStrings(imovel.local.cidade))) {
        autocomplete.push({type: 'cidade', value: replaceStrings(imovel.local.cidade)});
      }
      if (!autocomplete.includes(replaceStrings(imovel.local.bairro))) {
        autocomplete.push({type: 'bairro', value: replaceStrings(imovel.local.bairro)});
      }
    });
  }
  return admin.firestore().collection(COLLECTION_AUTOCOMPLETE).doc(COLLECTION_AUTOCOMPLETE).set({autocomplete});
}


const deleteCollection = (path: string): any => {
  // Get a new write batch
  const batch = admin.firestore().batch();

  return admin.firestore().collection(path).listDocuments().then(val => {
    const repeat = val.length > 500;
    for (let i = 0; i < 500; i++) {
      batch.delete(val[1]);
    }
    return batch.commit().then(value => {
      return repeat ? deleteCollection(path) : value;
    });
  });
}

export const clearFirestoreData = async (subCollections?: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>[]) => {
  const collections = subCollections ?? (await admin.firestore().listCollections());
  for (const coll of collections) {
    const fs = admin.firestore();
    const batch = new BigBatch({firestore: fs});
    const documents = await coll.listDocuments();

    for (const doc of documents) {
      await clearFirestoreData(await doc.listCollections());
      batch.delete(doc);
    }
    await batch.commit();
  }
  return;
}


export const _deleteDuplicateImovel = (): Promise<Imovel[]> => {
  return _getAllFromCollection(COLLECTION_IMOVEIS).then(imoveis => {
    return imoveis.filter(value => value.documentId !== value.sigla);
  }).then(async imoveis => {
    for (const imovel of imoveis) {
      await admin.firestore().collection(COLLECTION_IMOVEIS).doc(imovel.documentId).delete();
    }
    return imoveis;
  });
}

export async function _makeLocais(imoveis: Imovel[]): Promise<any> {
  const comprar_residencial: any[] = imoveis.filter(imovel => {
    return _get(imovel, "comercializacao.venda.ativa") === true && imovel.finalidade === 'residencial';
  });
  const comprar_comercial: any[] = imoveis.filter(imovel => {
    return _get(imovel, "comercializacao.venda.ativa") === true && imovel.finalidade === 'comercial';
  });
  const alugar_comercial: any[] = imoveis.filter(imovel => {
    return _get(imovel, "comercializacao.locacao.ativa") === true && imovel.finalidade === 'comercial';
  });
  const alugar_residencial: any[] = imoveis.filter(imovel => {
    return _get(imovel, "comercializacao.locacao.ativa") === true && imovel.finalidade === 'residencial';
  });


  return Promise.all([
    admin.firestore().collection(COLLECTION_LOCAIS).doc('comprar_residencial').set(buildLocal(comprar_residencial) as any, {merge: true}),
    admin.firestore().collection(COLLECTION_LOCAIS).doc('comprar_comercial').set(buildLocal(comprar_comercial) as any, {merge: true}),
    admin.firestore().collection(COLLECTION_LOCAIS).doc('alugar_residencial').set(buildLocal(alugar_residencial) as any, {merge: true}),
    admin.firestore().collection(COLLECTION_LOCAIS).doc('alugar_comercial').set(buildLocal(alugar_comercial) as any, {merge: true})
  ]);
}

const buildLocal = (imoveis: Imovel[]): any[] => {
  const cidadeBairro: any[] = [];
  imoveis.forEach(value => cidadeBairro.push({
    cidade: value.local.cidade || null,
    bairro: value.local.bairro || null,
    tipo: value.tipo || null
  }));
  return cidadeBairro.reduce((r, v, i, a, k = v.cidade) => ((r[k] || (r[k] = [])).push(v), r), {});
}

const adaptImovel = (imovel: Imovel): Imovel => {
  imovel['active_in_db'] = true;
  if (imovel?.local?.cidade === 'Paulinia') {
    imovel.local.cidade = 'Paulínia';
  }
  if (imovel?.local?.cidade && !imovel?.local?.cidade?.includes("/SP")) {
    imovel.local.cidade = `${imovel.local.cidade}/SP`
  }
  return imovel;
}
