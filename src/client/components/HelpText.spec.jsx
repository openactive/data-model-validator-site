import React from 'react';
import { shallow } from 'enzyme';

import HelpText from './HelpText.jsx';

describe('<HelpText />', () => {
  it('can render without error', () => {
    let wrapper;

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<HelpText />);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
  it('should call an event handler when clicking validate', () => {
    const onValidateClick = jasmine.createSpy('onValidateClick');

    const wrapper = shallow(<HelpText onValidateClick={onValidateClick}/>);

    wrapper.find('button').at(0).simulate('click');

    expect(onValidateClick).toHaveBeenCalled();
  });
  it('should not throw when clicking validate with no event handler', () => {
    const wrapper = shallow(<HelpText />);

    expect(() => {
      wrapper.find('button').at(0).simulate('click');
    }).not.toThrow();
  });
});
