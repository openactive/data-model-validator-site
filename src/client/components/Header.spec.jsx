import React from 'react';
import { shallow } from 'enzyme';

import Header from './Header.jsx';

describe('<Header />', () => {
  it('can render without error', () => {
    let wrapper;

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<Header />);
    }).not.toThrow();

    expect(wrapper.type()).toBe('header');
  });
});
