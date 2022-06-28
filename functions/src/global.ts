import * as functions from "firebase-functions";

const runtimeOpts: functions.RuntimeOptions = {
    timeoutSeconds: 540,
    memory: '1GB'
}
export const f = functions.runWith(runtimeOpts);
