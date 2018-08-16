import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { faExclamation } from '@fortawesome/free-solid-svg-icons/faExclamation';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faInfo } from '@fortawesome/free-solid-svg-icons/faInfo';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { faSquare } from '@fortawesome/free-solid-svg-icons/faSquare';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons/faCheckSquare';

import Home from './Home.jsx';
import About from './About.jsx';
import Rpde from './Rpde.jsx';

import '../scss/app.scss';

library.add(faTimes);
library.add(faTimesCircle);
library.add(faExclamation);
library.add(faExclamationCircle);
library.add(faCheck);
library.add(faCheckCircle);
library.add(faInfo);
library.add(faInfoCircle);
library.add(faExternalLinkAlt);
library.add(faSpinner);
library.add(faSquare);
library.add(faCheckSquare);


const Main = () => (
  <main className="h-100" role="main">
    <Switch>
      <Route exact path="/" component={Home}/>
      <Route path="/about" component={About}/>
      <Route path="/rpde" component={Rpde}/>
    </Switch>
  </main>
);

export default Main;
