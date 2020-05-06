import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import VersionHelper from '../helpers/version-helper';
import consts from '../data/consts';

const Footer = () => {
  const versions = VersionHelper.getUniqueVersions();
  let version = 'Modelling Opportunity Data Specification';
  let url = consts.MODELLING_SPECIFICATION_URL;
  if (versions.length === 1) {
    version = `v${versions[0]}`;
    const meta = VersionHelper.getVersionMetaData(versions[0]);
    url = meta.specUrl;
  }

  return (
    <footer className="footer fixed-bottom">
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <span>
              Stewarded by the <a href="http://theodi.org/">Open Data Institute</a> and <a href="https://www.sportengland.org/">Sport England</a>. See <a href="https://www.openactive.io/privacy-policy.html">Privacy and Cookie Policy</a>
            </span>
          </div>
          <div className="col text-right">
            Validating <a title="Modelling Opportunity Data Specification" aria-label="Modelling Opportunity Data Specification" href={url}>Model {version}</a> and <a title="Open Booking API Specification" aria-label="Open Booking API Specification" href="https://openactive.io/open-booking-api/EditorsDraft/">Booking v1.0 CR2</a>
            <span className="separator">&bull;</span>
            <a className="feedback-link" title="Give feedback in Github Issues" href="https://github.com/openactive/data-model-validator/issues" target="_blank" rel="noopener"><FontAwesomeIcon icon={['fab', 'github']} /> Give feedback</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
