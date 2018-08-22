import React from 'react';
import { shallow } from 'enzyme';

import ResultFilters from './ResultFilters.jsx';

describe('<ResultFilters />', () => {
  it('should render without error', () => {
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
    const severities = {
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<ResultFilters results={errors} severities={severities}/>);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
  it('should render nothing when there are no results', () => {
    const wrapper = shallow(<ResultFilters results={[]}/>);
    expect(wrapper.html()).toBe(null);
  });
  it('should render nothing when there are no categories or severities', () => {
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
    const wrapper = shallow(<ResultFilters results={errors}/>);
    expect(wrapper.html()).toBe(null);
  });
  it('should display the number of each type of severity', () => {
    const severities = {
      failure: {
        name: 'Error',
        icon: 'times',
        iconCircle: 'times-circle',
      },
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
      notice: {
        name: 'Notice',
        icon: 'info',
        iconCircle: 'info-circle',
      },
    };
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'failure',
        path: '$',
      },
    ];

    const wrapper = shallow(<ResultFilters results={errors} severities={severities}/>);

    const items = wrapper.find('label.form-check-label-severity');

    expect(items.at(0).text()).toBe('Show all');
    expect(items.at(1).childAt(0).html()).toBe('<span>1 Error</span>');
    expect(items.at(2).childAt(0).html()).toBe('<span>2 Warnings</span>');
    expect(items.at(3).childAt(0).html()).toBe('<span>0 Notices</span>');
  });
  it('should display the number of each type of category', () => {
    const categories = {
      conformance: {
        name: 'Conformance',
      },
      'data-quality': {
        name: 'Data Quality',
      },
      internal: {
        name: 'General',
      },
    };
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$',
      },
      {
        category: 'conformance',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'failure',
        path: '$',
      },
    ];

    const wrapper = shallow(<ResultFilters results={errors} categories={categories}/>);

    const items = wrapper.find('label.form-check-label-category');

    expect(items.at(0).text()).toBe('Show all');
    expect(items.at(1).text()).toBe('1 Conformance');
    expect(items.at(2).text()).toBe('2 Data Quality');
    expect(items.at(3).text()).toBe('0 General');
  });
  it('should call an event handler when changing a severity toggle', () => {
    const severities = {
      failure: {
        name: 'Error',
        icon: 'times',
        iconCircle: 'times-circle',
      },
    };
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

    const onChange = jasmine.createSpy('onChange');

    const wrapper = shallow(<ResultFilters results={errors} severities={severities} onFilterChange={onChange}/>);

    wrapper.find('.form-check').at(1).simulate('click');

    expect(onChange).toHaveBeenCalledWith('severity', 'failure');
  });
  it('should call an event handler when changing a category toggle', () => {
    const categories = {
      conformance: {
        name: 'Conformance',
      },
    };
    const errors = [
      {
        category: 'conformance',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'failure',
        path: '$',
      },
    ];

    const onChange = jasmine.createSpy('onChange');

    const wrapper = shallow(<ResultFilters results={errors} categories={categories} onFilterChange={onChange}/>);

    wrapper.find('.form-check').at(1).simulate('click');

    expect(onChange).toHaveBeenCalledWith('category', 'conformance');
  });
});
