import * as functions from "firebase-functions";
import { processSignUp as _processSignUp } from "./processSignUp";

const region = "asia-northeast1";

export const helloWorld = functions
  .region(region)
  .https
  .onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
  });

export const processSignUp = functions
  .region(region)
  .auth
  .user()
  .onCreate(_processSignUp);
