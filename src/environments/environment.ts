// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAsBH7UdNmvNFwQxVW1U_BArhcRnFjW1zI",
    authDomain: "next-jsonserver.firebaseapp.com",
    databaseURL: "https://next-jsonserver.firebaseio.com",
    projectId: "next-jsonserver",
    storageBucket: "next-jsonserver.appspot.com",
    messagingSenderId: "903482938489",
    appId: "1:903482938489:web:6f69430786f8704686f0a8"
  },
  maps: {
    key: 'AIzaSyDdNbp5hzfU6wveRvoBxMUuIVQ8GKngYsM'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
