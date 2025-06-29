const min_number_of_elements = 3;
const fs = require('fs');
const path = require('path');

const url = "https://services.arcgis.com/xsiPoFK0f7RrxF0D/ArcGIS/rest/services/LA_City_Evacuation_Areas/FeatureServer/0/query?where=Shape__Area%3E0&objectIds=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=Label&returnGeometry=true&returnCentroid=false&returnEnvelope=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&collation=&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnTrueCurves=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=";

fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.error || !data.features) {
            console.error("Timed out for LA fire server");
            return;
        }
        //save data to file data/evac_california.json

        const data_dir = path.join(__dirname, 'data');

        if (!fs.existsSync(data_dir)) {
            fs.mkdirSync(data_dir);
        }

        const file_path = path.join(data_dir, 'los_angeles_evac.json');

        fs.writeFile(file_path, JSON.stringify(data), (error) => {
            if (error) {
                console.error(error);
                return;
            }
            console.log("Data saved to file");
        });

    })
    .catch(error => console.error(error));
