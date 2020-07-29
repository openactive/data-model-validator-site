const fs = require('fs');
const path = require('path');
const request = require('sync-request');

const cacheDir = path.join(__dirname, '../cache');

const assets = [
  {
    name: 'schemaOrgSpec',
    url: 'https://schema.org/version/latest/schemaorg-current-https.jsonld',
  },
];

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

console.log('Fetching schema.org vocab...')
for (const asset of assets) {
  const fileName = path.join(cacheDir, `${asset.name}.json`);
  const body = request('GET', asset.url, {
    headers: {
      'Content-Type': 'application/ld+json',
    },
  }).getBody();

  fs.writeFile(fileName, body, 'utf8', (error) => {
    if (error) {
      throw new Error(`Unable to write schema.org cache: ${error}`);
    }
    console.log('schema.org vocab downloaded successfully.')
  });
}
