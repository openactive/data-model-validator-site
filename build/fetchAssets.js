const fs = require('fs');
const path = require('path');
const request = require('request');

const cacheDir = path.join(__dirname, '../cache');

const assets = [
  {
    name: 'activityList',
    url: 'https://www.openactive.io/activity-list/activity-list.jsonld',
  },
  {
    name: 'schemaOrgSpec',
    url: 'https://schema.org/version/latest/schema.jsonld',
  },
];

if (!fs.existsSync(cacheDir)){
  fs.mkdirSync(cacheDir);
}

for (const asset of assets) {
  const fileName = path.join(cacheDir, `${asset.name}.json`);
  const file = fs.createWriteStream(fileName);
  request(asset.url).pipe(file);
}
