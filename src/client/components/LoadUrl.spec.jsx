import React from 'react';
import { shallow } from 'enzyme';

import LoadUrl from './LoadUrl.jsx';

describe('<LoadUrl />', () => {
  it('can render without error', () => {
    let wrapper;

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<LoadUrl url="http://example.org"/>);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
  it('should have an input value of the URL we pass in', () => {
    const url = 'http://example.org';

    const wrapper = shallow(<LoadUrl url={url}/>);

    expect(wrapper.find('.form-control').at(0).prop('value')).toEqual('http://example.org');
    expect(wrapper.state('url')).toEqual('http://example.org');
  });
  it('should call an event handler when submitting a URL', () => {
    const url = 'http://example.org';

    const onClick = jasmine.createSpy('onClick');

    const wrapper = shallow(<LoadUrl url={url} onUrlClick={onClick} />);

    wrapper.find('.btn-primary--ghost').at(0).simulate('click');

    expect(onClick).toHaveBeenCalled();
  });
});
