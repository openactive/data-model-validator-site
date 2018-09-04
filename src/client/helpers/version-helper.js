import { versions, getMetaData, getExamples } from '@openactive/data-models';
import semver from 'semver';

export default class VersionHelper {
  static getVersions() {
    return versions;
  }

  static getUniqueVersions() {
    const versionArray = [];
    for (const version in versions) {
      if (Object.prototype.hasOwnProperty.call(versions, version)) {
        if (semver.valid(semver.coerce(version))) {
          if (versionArray.indexOf(version) < 0) {
            versionArray.push(version);
          }
        }
      }
    }
    versionArray.sort((a, b) => {
      if (semver.lt(semver.coerce(a), semver.coerce(b))) {
        return 1;
      }
      if (semver.gt(semver.coerce(a), semver.coerce(b))) {
        return -1;
      }
      return 0;
    });
    return versionArray;
  }

  static getLatestVersion() {
    for (const version in versions) {
      if (Object.prototype.hasOwnProperty.call(versions, version)) {
        if (semver.valid(semver.coerce(version)) && versions[version] === versions.latest) {
          return version;
        }
      }
    }
    const uniqueVersions = this.getUniqueVersions();
    return uniqueVersions.length > 0 ? uniqueVersions[0] : 'latest';
  }

  static getTranslatedVersion(version) {
    if (typeof versions[version] !== 'undefined') {
      return versions[version];
    }
    return version;
  }

  static getVersionExamples(version) {
    return getExamples(version);
  }

  static getVersionMetaData(version) {
    return getMetaData(version);
  }
}
