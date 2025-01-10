# Catenary Fire Bounds Cache

The following data source can be edited manually: 
```
/manual_data/firenames.json
/manual_data/evac.json
```

Edit manually steps:

1. Copy data into https://geojson.io/
2.
   - For firenames.json: Draw points and fill in field called `name`
   - For evac.json: Draw areas and label field key `status` with either `set` or `go`
4. Copy data back into the file, save, and commit, and upload.

All other data sources update automatically via GitHub actions every 5 minutes. Force updates can be done by visiting Actions tab on GitHub repo site and running the action under the actions called "manually update".
