import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';
import Navbar from './components/Navbar.jsx';

import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/collapse';

ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<Navbar />, document.getElementById('navbar'));
