const min_number_of_elements = 10;
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

    /*Format is like

    [
        {
            "id": 31,
            "name": "orange-CA_US",
            "slug": "orange-CA_US",
            "is_reporter_covered_for_fire": true,
            "state": "CA",
            "display_name": "Orange County",
            "state_display_name": "California",
            "date_created": "2022-05-31T17:37:42Z",
            "date_modified": "2023-02-01T22:57:37Z",
            "is_active": true
          },
    ]
    */

fetch("https://api.watchduty.org/api/v1/regions")
.then(response => response.json())
.then(data => {
    //filter for state == CA

    const california_regions = data.filter(region => region.state == "CA");

    let region_ids = california_regions.map(region => region.id);

    fetch("https://api.watchduty.org/api/v1/evac_zones?region_ids=" + region_ids.join(","))
    .then(response => response.json())
    .then(data => {
        //save to data/evac_zones_watchduty.json

        const data_dir = path.join(__dirname, 'data');

        if (!fs.existsSync(data_dir)) {
            fs.mkdirSync(data_dir);
        }

        const file_path = path.join(data_dir, 'evac_zones_watchduty.json');

        fs.writeFile(file_path, JSON.stringify(data), (error) => {
            if (error) {
                console.error(error);
                return;
            }
            console.log("Watchduty data saved to file");
        });
    })
    .catch(error => console.error(error));
})