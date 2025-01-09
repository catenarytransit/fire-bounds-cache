# Catenary Fire Bounds Cache

The following data source can be edited manually: 
```
/data/firenames.json
```

Edit manually steps:

1. Copy data into https://geojson.io/
2. Draw points and fill in field called `name`
3. Copy data back into the file, save, and commit, and upload.

All other data sources update automatically via GitHub actions every 5 minutes. Force updates can be done by visiting Actions tab on GitHub repo site and running the action under the actions called "manually update".
