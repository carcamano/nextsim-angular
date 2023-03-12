import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {fetch as crossFetch} from "cross-fetch";
import {COLLECTION_IMOVEIS, Imovel} from "./model/model";
import {
    _deleteAllImoveisInDB,
    _getAllFromCollection,
    _getAllImoveisFromAPI,
    _makeAutoComplete, _makeLocais,
    replaceStrings
} from "./functions";
import DataSnapshot = admin.database.DataSnapshot;

exports.scheduledFunction14 = functions.pubsub.schedule('every day 19:00')
    .timeZone('America/Sao_Paulo').onRun( () => {
        return admin.database().ref('/imoveis').orderByKey().once("value", async (a: DataSnapshot) => {
          var autocomplete: string[] = [];
          if (a.exists()) {
            a.forEach((imovel: DataSnapshot) => {
              if (!autocomplete.includes(replaceStrings(imovel.val().sigla))) {
                autocomplete.push(replaceStrings(imovel.val().sigla));
              }
              if (!autocomplete.includes(replaceStrings(imovel.val().local.cidade))) {
                autocomplete.push(replaceStrings(imovel.val().local.cidade));
              }
              if (!autocomplete.includes(replaceStrings(imovel.val().local.bairro))) {
                autocomplete.push(replaceStrings(imovel.val().local.bairro));
              }
            });
            const ss = await admin.database().ref('/').update({ autocomplete: autocomplete }).then(r => {
              console.log(r);
            }).catch(reason => console.log(reason));
            console.log(ss);
          }
          return undefined;
        }, (fail: any) => {
            console.log(fail);
          return undefined
        })
    })

exports.scheduledFunction13 = functions.pubsub.schedule('every day 18:30')
    .timeZone('America/Sao_Paulo').onRun(() => {
        return crossFetch('https://turbo.gestaoreal.com.br/exportacao/Imoveis?imob=5796bc63c096d580178b4575').then((value: Response) => {
            // return crossFetch('https://json-solo-teste.herokuapp.com/').then((value: Response) => {
            return value.json().then((value1: Imovel[]) => {
                var imoveis = value1.filter((imovel, index) => {
                    if (imovel && imovel.comercializacao && imovel.comercializacao.locacao && imovel.comercializacao.locacao.ativa) {
                        return true;
                    } else if (imovel && imovel.comercializacao && imovel.comercializacao.venda && imovel.comercializacao.venda.ativa) {
                        return true;
                    }
                    return false;
                }).map(imovel => imovel);

                return admin.database().ref('/imoveis').set(imoveis).then(r => {
                    console.log(r);
                }).catch(reason => console.log(reason));

            });

        });
    });

exports.scheduledFunctionfirestore = functions.pubsub.schedule('every day 01:30')
    .timeZone('America/Sao_Paulo').onRun(() => {
        return admin.firestore().collection('imoveis').listDocuments().then(val => {
            val.map(v => v.delete().then(value => console.log(value)).catch(error => console.log(error)));
        });
    });


exports.scheduledFunctionfirestore2 = functions.pubsub.schedule('every day 01:40')
    .timeZone('America/Sao_Paulo').onRun(() => {
        return crossFetch('https://turbo.gestaoreal.com.br/exportacao/Imoveis?imob=5796bc63c096d580178b4575').then((value: Response) => {
            return value.json().then((value1: Imovel[]) => {
                console.log(value1);
                var imoveis = value1.filter((imovel, index) => {
                    if (imovel && imovel.comercializacao && imovel.comercializacao.locacao && imovel.comercializacao.locacao.ativa) {
                        return true;
                    } else if (imovel && imovel.comercializacao && imovel.comercializacao.venda && imovel.comercializacao.venda.ativa) {
                        return true;
                    }
                    return false;
                }).map(imovel => imovel);

                console.log(imoveis);
                imoveis.forEach(imovel => {
                    return admin.firestore().collection('imoveis').add(imovel).then(value2 => console.log(value2)).catch(reason => console.log(reason));
                });

                return;

            });

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
                    console.log('Added: ')
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

