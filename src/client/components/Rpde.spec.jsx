import React from 'react';
import { shallow } from 'enzyme';

import Rpde from './Rpde.jsx';

describe('<Rpde />', () => {
  it('can render without error', () => {
    let wrapper;

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<Rpde />);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
});
