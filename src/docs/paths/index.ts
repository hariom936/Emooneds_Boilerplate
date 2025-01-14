import { readdirSync } from 'fs';

const apiPaths = {};
const thisFileName = __filename.split('/').slice(-1)[0];

readdirSync(__dirname).forEach((fileName) => {
  if (fileName !== thisFileName) {
    Object.assign(apiPaths, { ...require('./' + fileName) });
  }
});

export default apiPaths;
