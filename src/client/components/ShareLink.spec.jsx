import React from 'react';
import { shallow } from 'enzyme';

import ShareLink from './ShareLink.jsx';

describe('<ShareLink />', () => {
  it('can render without error', () => {
    let wrapper;

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<ShareLink url="http://example.org"/>);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
  it('should have an input value of the URL we pass in', () => {
    const url = 'http://example.org';

    const wrapper = shallow(<ShareLink url={url}/>);

    expect(wrapper.find('.form-control').at(0).prop('value')).toEqual('http://example.org');
  });
});
