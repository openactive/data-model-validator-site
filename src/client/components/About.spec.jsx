import React from 'react';
import { shallow } from 'enzyme';

import About from './About.jsx';

describe('<About />', () => {
  it('can render without error', () => {
    let wrapper;

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<About />);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
});
