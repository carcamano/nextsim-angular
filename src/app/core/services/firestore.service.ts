import {Observable} from 'rxjs';
import {finalize, map, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  QueryFn
} from "@angular/fire/compat/firestore";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

@Injectable()
export class FirestoreService {

  constructor(private readonly afs: AngularFirestore) {
  }

  static PATH_ESTABLISHMENTS = 'establishments/';
  static PATH_SALONS = 'salons/';
  static PATH_APPOINTMENTS = 'appointments/';
  static PATH_RECURRING_SCHEDULING = 'recurring_scheduling/';
  static PATH_STAFFS = 'staffs/';
  static PATH_CLIENTS = 'clients/';
  static PATH_SERVICES = 'services/';
  static PATH_PRODUCTS = 'products/';
  static PATH_CATEGORIES = 'categories/';
  static PATH_SERVICE_CATEGORIES = 'service_categories/';
  static PATH_ORDERS = 'orders/';
  static PATH_UNAVAILABLE = 'unavailable/';
  static PATH_LOGS = 'logs/';
  static PATH_COMMUNICATION = 'communications/';
  static PATH_WEB_HOOKS = 'webHooksIUGU/';

  private salonId: string = null;


  private firestoreCollection: AngularFirestoreCollection;
  private itemDoc: AngularFirestoreDocument<any>;


  private normalizePath(path: string) {
    if (path.charAt(path.length - 1) === '/') {
      return path;
    }
    return path + '/';
  }

  public getCollection(path: string, queryFn?: QueryFn): Observable<any[]> {
    this.firestoreCollection = this.afs.collection<any>(path, queryFn);
    return this.firestoreCollection.get().pipe(
      map(actions => actions.docs.map(a => {
        return a.data();
      })));
  }


  public observerCollection(path: string, queryFn?: QueryFn): Observable<any[]> {
    this.firestoreCollection = this.afs.collection<any>(path, queryFn);
    return this.firestoreCollection.snapshotChanges().pipe(
      map(actions => actions.map((a) => {
        return a.payload.doc.data();
      })));
  }

  public deleteDocument(path: string, documentId: string): Promise<void> {
    this.firestoreCollection = this.afs.collection<any>(path);
    return this.firestoreCollection.doc(documentId).delete();
  }

  public observerDocument(path: string, documentId: string): Observable<any> {
    this.itemDoc = this.afs.doc<any>(this.normalizePath(path) + documentId);
    return this.itemDoc.snapshotChanges().pipe(
      map((a) => {
        return a.payload.data();
      }));
  }


  public getDocument(path: string, documentId: string): Observable<any> {
    this.itemDoc = this.afs.doc<any>(this.normalizePath(path) + documentId);
    return this.itemDoc.get().pipe(
      map((a) => {
        return a.data();
      }));
  }


  public addOrUpdate(path: string, model: any): Observable<any> {
    if (!model) {
      return;
    }
    this.firestoreCollection = this.afs.collection<any>(path);
    return new Observable<any>(subscriber => {
      model.platform = 'web';
      if (model.documentId) {
        model.updatedAt = Timestamp.now();
        this.firestoreCollection.doc(model.documentId).update(model.toObject()).then(v => {
          subscriber.next(model);
        });
      } else {
        const documentId = this.afs.createId();
        this.firestoreCollection.doc(documentId).set(model.toObject()).then(value => {
          subscriber.next(model);
        });
      }
    });
  }

  public setDocument(path: string, model: any): Observable<any> {
    if (!model) {
      return;
    }
    this.firestoreCollection = this.afs.collection<any>(path);
    return new Observable<any>(subscriber => {
      if (model.documentId) {
        model.updatedAt = Timestamp.now();
        this.firestoreCollection.doc(model.documentId).set(model.toObject()).then(v => {
          subscriber.next(model);
        });
      }
    });
  }

  public updateAttribute(path: string, documentId: string, values: any): Observable<boolean> {
    return new Observable<boolean>(subscriber => {
      this.afs.collection(path).doc(documentId).update(values).then(value => {
        subscriber.next(true);
      })
        .catch(reason => subscriber.next(false));
    });
  }

}
