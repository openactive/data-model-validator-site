import fs from 'fs';
import path from 'path';
import request from 'request';

const cacheDir = path.join(__dirname, '../cache');

const assets = [
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
  // const file = fs.createWriteStream(fileName);
  request(asset.url, (err, res, body) => {
    if (!err) {
      const transformedBody = body.replace(/http:\/\/schema\.org/g, 'https://schema.org');
      fs.writeFile(fileName, transformedBody, 'utf8', err => {
        if (err) {
          console.log(err);
        }
      });
    } else {
      console.log(err);
    }
  });
}
