import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { EventContext, auth } from "firebase-functions";

initializeApp();

// eslint-disable-next-line require-jsdoc
export async function processSignUp(
  user: auth.UserRecord,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: EventContext
): Promise<void> {
  if (
    !user.email
  ) {
    return;
  }

  const customClaims = {
    groupIds: [
      user.uid,
    ],
  };

  try {
    await getAuth().setCustomUserClaims(user.uid, customClaims);

    const db = getFirestore();
    const metadataRef = db.collection("metadata").doc(user.uid);

    await metadataRef.set({ refreshTime: new Date().getTime() });
  } catch (error) {
    console.log(error);
  }
}
