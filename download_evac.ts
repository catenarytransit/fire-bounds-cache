const min_number_of_elements = 0;
const fs = require('fs');
const path = require('path');

import { createFetch } from "node-fetch-native/proxy";

const url = "https://services3.arcgis.com/uknczv4rpevve42E/arcgis/rest/services/CA_EVACUATIONS_PROD/FeatureServer/0/query/?spatialRel=esriSpatialRelIntersects&f=geojson&where=SHAPE__Area>0&outFields=*";
try {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const features = data.features;
            if (features.length <= min_number_of_elements) {
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
} catch (e) { console.error(e) }
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

fetch("https://api.watchduty.org/api/v1/geo_events/?is_relevant=true&geo_event_types=wildfire&ts=" + Date.now(), {
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
    },
    "method": "GET",
    "mode": "cors"
})
    .then(response => response.text())
    .then(data => {
        //write data to file data/watchduty_events.json

        if (data) {
            // console.log(data);

            let json_data = JSON.parse(data);

            const data_dir = path.join(__dirname, 'data');

            if (!fs.existsSync(data_dir)) {
                fs.mkdirSync(data_dir);
            }

            const data_copy = json_data.filter((fire) => fire.notification_type != "silent");

            for (let i = 0; i < data_copy.length; i++) {
                //evacuation_orders_arr: fire.data.evacuation_orders.split(",").map((order) => order.trim()),

                if (data_copy[i].data) {
                    if (data_copy[i].data.evacuation_orders) {
                        data_copy[i].evacuation_orders_arr = data_copy[i].data.evacuation_orders.split(",").map((order) => order.trim());
                    }

                    if (data_copy[i].data.evacuation_warnings) {
                        data_copy[i].evacuation_warnings_arr = data_copy[i].data.evacuation_warnings.split(",").map((warning) => warning.trim());
                    }
                }
            }

            const file_path = path.join(data_dir, 'watchduty_events.json');

            fs.writeFile(file_path, JSON.stringify(data_copy, null, "\t"), (error) => {
                if (error) {
                    console.error(error);
                    return;
                }
                console.log("Watchduty Data saved to file");
            });

        } else {
            console.error("No data found from watchduty API");
        }
    })
    .catch(error => console.error(error));
