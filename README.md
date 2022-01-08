## How to setup

### CORS setting to Cloud Storage

```
gcloud auth login
gsutil cors set cors.json gs://price-memo-dev.appspot.com
```

### Update local firestore.indexes.json from remote

```
firebase firestore:indexes > firestore.indexes.json
```
