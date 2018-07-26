import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LoadingOverlay = () => (
  <div className="loading-overlay">
    <FontAwesomeIcon icon="spinner" spin size="6x"/>
  </div>
);

export default LoadingOverlay;
