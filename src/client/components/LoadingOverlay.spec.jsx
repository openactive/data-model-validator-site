import React from 'react';
import { shallow } from 'enzyme';

import LoadingOverlay from './LoadingOverlay.jsx';

describe('<LoadingOverlay />', () => {
  it('can render without error', () => {
    let wrapper;

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<LoadingOverlay />);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
});
