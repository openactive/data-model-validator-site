import React from 'react';
import { shallow } from 'enzyme';

import ResultSort from './ResultSort.jsx';

describe('<ResultSort />', () => {
  it('can render without error', () => {
    let wrapper;
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$',
      },
    ];

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<ResultSort results={errors}/>);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
  it('should render nothing when there are no results', () => {
    const wrapper = shallow(<ResultSort results={[]}/>);
    expect(wrapper.html()).toBe(null);
  });
  it('should call an event handler when changing a sort toggle', () => {
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'failure',
        path: '$',
      },
    ];
    const sort = 'severity';

    const onChange = jasmine.createSpy('onChange');

    const wrapper = shallow(<ResultSort results={errors} sort={sort} onSortChange={onChange}/>);

    wrapper.find('.form-check').at(0).simulate('click');

    expect(onChange).toHaveBeenCalledWith('rowCol');
  });
});
