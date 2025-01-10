const min_number_of_elements = 5;
const fs = require('fs');
const path = require('path');

const url = "https://services3.arcgis.com/uknczv4rpevve42E/arcgis/rest/services/CA_EVACUATIONS_PROD/FeatureServer/0/query/?spatialRel=esriSpatialRelIntersects&f=geojson&where=SHAPE__Area>0&outFields=*";

fetch(url)
    .then(response => response.json())
    .then(data => {
        const features = data.features;
        if (features.length < min_number_of_elements) {
        console.error("No data found, only " + features.length + " elements");
        return;
        }
        //save data to file data/evac_california.json

        const data_dir = path.join(__dirname, 'data');

        if (!fs.existsSync(data_dir)) {
            fs.mkdirSync(data_dir);
        }

        const file_path = path.join(data_dir, 'evac_california.json');

        fs.writeFile(file_path, JSON.stringify(data), (error) => {
            if (error) {
                console.error(error);
                return;
            }
            console.log("Data saved to file");
        });

    })
    .catch(error => console.error(error));

