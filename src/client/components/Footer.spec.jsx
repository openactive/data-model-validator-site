import React from 'react';
import { shallow } from 'enzyme';

import Footer from './Footer.jsx';

describe('<Footer />', () => {
  it('can render without error', () => {
    let wrapper;

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<Footer />);
    }).not.toThrow();

    expect(wrapper.type()).toBe('footer');
  });
});
