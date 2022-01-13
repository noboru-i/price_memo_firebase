import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, serverTimestamp, setDoc, setLogLevel } from 'firebase/firestore';
import { createWriteStream, readFileSync } from 'fs';
import http from "http";
import { after, before, beforeEach, it } from 'mocha';

let testEnv: RulesTestEnvironment;

before(async () => {
  // Silence expected rules rejections from Firestore SDK. Unexpected rejections
  // will still bubble up and will be thrown as an error (failing the tests).
  setLogLevel('error');

  testEnv = await initializeTestEnvironment({
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    projectId: 'demo-test'
  });

});

after(async () => {
  await testEnv.cleanup();

  const coverageFile = 'firestore-coverage.html';
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    const { host, port } = testEnv.emulators.firestore!;
    const quotedHost = host.includes(':') ? `[${host}]` : host;
    http.get(`http://${quotedHost}:${port}/emulator/v1/projects/${testEnv.projectId}:ruleCoverage.html`, (res) => {
      res.pipe(fstream, { end: true });

      res.on("end", resolve);
      res.on("error", reject);
    });
  });

  console.log(`View firestore rule coverage information at ${coverageFile}\n`);
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Group', () => {
  it('should allow users have groupIds', async () => {
    const groupId = "foo-group-id";
    const db = testEnv.authenticatedContext('foo', {'groupIds': [groupId]}).firestore();
    const collectionPath = `groups/${groupId}`;
    await setDoc(doc(db, collectionPath), { name: 'bar' });

    await assertSucceeds(getDoc(doc(db, collectionPath)));
    await assertFails(getDoc(doc(db, collectionPath + 'a')));
  });
});

describe('Product', () => {
  it('should allow users have groupIds', async () => {
    const groupId = "foo-group-id";
    const db = testEnv.authenticatedContext('foo', {'groupIds': [groupId]}).firestore();
    const collectionPath = `groups/${groupId}/products/a`;
    await setDoc(doc(db, collectionPath), {
      name: 'bar',
      latestPrice: 100,
      groupId
    });

    await assertSucceeds(getDoc(doc(db, collectionPath)));

    const db2 = testEnv.authenticatedContext('foo', {'groupIds': [groupId + 'a']}).firestore();
    await assertFails(getDoc(doc(db2, collectionPath)));
  });
});

describe('PriceHistory', () => {
  it('should allow users have groupIds', async () => {
    const groupId = "foo-group-id";
    const db = testEnv.authenticatedContext('foo', {'groupIds': [groupId]}).firestore();
    const collectionPath = `groups/${groupId}/products/a/price-histories/b`;
    await setDoc(doc(db, collectionPath), {
      createdAt: serverTimestamp(),
      price: 100
    });

    await assertSucceeds(getDoc(doc(db, collectionPath)));

    const db2 = testEnv.authenticatedContext('foo', {'groupIds': [groupId + 'a']}).firestore();
    await assertFails(getDoc(doc(db2, collectionPath)));
  });
});
