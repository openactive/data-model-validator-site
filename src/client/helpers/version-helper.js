import { versions } from '@openactive/data-models';

export default class VersionHelper {
  static getVersions() {
    return versions;
  }

  static getUniqueVersions() {
    return [...new Set(Object.values(versions))];
  }
}
