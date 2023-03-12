import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import {f} from './global';
import {
  _deleteAllImoveisInDB, _deleteDuplicateImovel,
  _getAllFromCollection,
  _getAllImoveisFromAPI, _getAllImoveisFromBackup,
  _makeAutoComplete,
  _makeLocais, _saveAllLocalImoveis
} from "./functions";
import {COLLECTION_IMOVEIS, Imovel} from "./model/model";


admin.initializeApp(functions.config().firebase);

export const getAllImoveisFromAPI = f.https.onRequest((req: any, resp: { send: (arg0: { imoveis?: boolean | { imoveis: void | Imovel[] | undefined; }; success?: boolean; reason?: any; }) => void; }) => {
  return _getAllImoveisFromAPI()?.then(imoveis => {
    resp.send({imoveis});
  }).catch(reason => {
    resp.send({success: false, reason: reason});
  });
});

export const getAllImoveisFromBackup = f.https.onRequest((req: any, resp: { send: (arg0: { imoveis?: boolean | { imoveis: void | Imovel[] | undefined; }; success?: boolean; reason?: any; }) => void; }) => {
  return _getAllImoveisFromBackup(req.query.file)?.then(imoveis => {
    resp.send({imoveis});
  }).catch(reason => {
    resp.send({success: false, reason: reason});
  });
});

export const deleteAllImoveisInDB = f.https.onRequest(async (req: any, resp: { send: (arg0: { value?: any; reason?: any; }) => void; }) => {
  try {
    const value = await _deleteAllImoveisInDB();
    resp.send({value});
  } catch (reason) {
    resp.send({reason});
  }
});


export const makeAutoComplete = f.https.onRequest(async (req: any, resp: { send: (arg0: { value?: any; reason?: any; }) => void; }) => {
  const imoveis = await _getAllFromCollection(COLLECTION_IMOVEIS);
  try {
    const value = await _makeAutoComplete(imoveis);
    resp.send({value});
  } catch (reason) {
    console.error(reason);
    resp.send({reason});
  }
});

export const makeLocais = f.https.onRequest(async (req: any, resp: { send: (arg0: any) => void; }) => {
  const imoveis = await _getAllFromCollection(COLLECTION_IMOVEIS);
  try {
    const value = await _makeLocais(imoveis);
    console.log('Added: ');
    resp.send(value);
    return;
  } catch (reason) {
    console.error(reason);
    return;
  }
});

export const deleteDuplicateImovel = f.https.onRequest(async (req: any, resp: { send: (arg0: Imovel[]) => void; }) => {
  const imoveis = await _deleteDuplicateImovel();
  resp.send(imoveis);
  return;
});

export const saveAllLocalImoveis = f.https.onRequest(async (req, resp) => {
  const imoveis =  _saveAllLocalImoveis()
  resp.send(imoveis);
  return
});


// export * from './schedule';

exports.scheduledSaveAllLocalImoveis = functions.pubsub.schedule('every day 00:30')
  .timeZone('America/Sao_Paulo').onRun(() => {
    return _saveAllLocalImoveis().then(value => {
      console.log(value);
      return;
    }).catch(reason => {
      return;
    });
  });

exports.scheduledDeleteAllImoveisInDB = functions.pubsub.schedule('every day 01:21')
  .timeZone('America/Sao_Paulo').onRun(() => {
    return _deleteAllImoveisInDB().then(value => {
      return;
    }).catch(reason => {
      return;
    });
  });

exports.scheduledGetAllImoveisFromAPI = functions.pubsub.schedule('every day 01:35')
  .timeZone('America/Sao_Paulo').onRun(() => {
    return _getAllImoveisFromAPI()?.then(imoveis => {
      return;
    }).catch(reason => {
      return;
    });
  });


exports.scheduledMakeAutocomplete = functions.pubsub.schedule('every day 02:00')
  .timeZone('America/Sao_Paulo').onRun(() => {
    return _getAllFromCollection(COLLECTION_IMOVEIS).then(imoveis => {
      return _makeAutoComplete(imoveis)
        .then(value => {
          return;
        }).catch(reason => {
          console.error(reason);
          return;
        });
    });
  });

exports.scheduledMakeLocais = functions.pubsub.schedule('every day 02:10')
  .timeZone('America/Sao_Paulo').onRun(() => {
    return _getAllFromCollection(COLLECTION_IMOVEIS).then(imoveis => {
      return _makeLocais(imoveis)
        .then(value => {
          console.log('Added: ')
          return;
        }).catch(reason => {
          console.error(reason);
          return;
        });
    });
  });


exports.scheduledDeleteDuplicateImoveis = functions.pubsub.schedule('every day 02:30')
  .timeZone('America/Sao_Paulo').onRun(() => {
    return _deleteDuplicateImovel().then(imoveis => {
      console.log('FINISHED: ')
      return;
    }).catch(reason => {
      console.error(reason);
      return;
    });
  });
