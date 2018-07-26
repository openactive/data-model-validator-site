const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const cacheDir = path.join(__dirname, '../cache');

const assets = [
  {
    name: 'activityList',
    url: 'https://www.openactive.io/activity-list/activity-list.jsonld',
  },
];

if (!fs.existsSync(cacheDir)){
  fs.mkdirSync(cacheDir);
}

for (const asset of assets) {
  const fileName = path.join(cacheDir, `${asset.name}.json`);
  const file = fs.createWriteStream(fileName);
  if (asset.url.match(/^https/)) {
    https.get(asset.url, (response) => {
      response.pipe(file);
    });
  } else {
    http.get(asset.url, (response) => {
      response.pipe(file);
    });
  }

}
