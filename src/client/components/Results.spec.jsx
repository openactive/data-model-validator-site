import React from 'react';
import { shallow } from 'enzyme';

import Results from './Results.jsx';

describe('<Results />', () => {
  it('can render without error', () => {
    let wrapper;

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<Results results={[]}/>);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
  it('should render the correct line and column numbers of errors', () => {
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$.type',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$["http://schema.org/description"][0].type',
      },
    ];
    const tokenMap = {
      $: [0, 0],
      '$.type': [2, 4],
      '$["http://schema.org/description"]': [3, 7],
    };
    const severities = {
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };

    const wrapper = shallow(<Results severities={severities} group={false} results={errors} tokenMap={tokenMap}/>);

    const items = wrapper.find('.result-line-col');

    expect(items.at(0).text()).toBe('Line 3, col 4');
    expect(items.at(1).text()).toBe('Line 4, col 7');
  });

  it('should call the onResultClick handler when a result is clicked', () => {
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$.type',
      },
    ];
    const severities = {
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };

    const onResultClick = jasmine.createSpy('onResultClick');

    const wrapper = shallow(<Results group={false} severities={severities} results={errors} onResultClick={onResultClick}/>);

    const items = wrapper.find('.item-item');
    items.at(0).simulate('click');

    expect(onResultClick).toHaveBeenCalled();
  });

  it('should call the onResetFilters handler when "reset filters" is clicked', () => {
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
    const filter = {
      severity: {
        failure: false,
      },
    };
    const severities = {
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };

    const onResetFilters = jasmine.createSpy('onResetFilters');

    const wrapper = shallow(
      <Results
        severities={severities}
        filter={filter}
        results={errors}
        onResetFilters={onResetFilters}
        />,
    );

    const items = wrapper.find('.remove-filters');
    items.at(0).simulate('click');

    expect(onResetFilters).toHaveBeenCalled();
  });

  it('should hide elements hidden by filters', () => {
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
    const filter = {
      severity: {
        warning: false,
      },
    };
    const severities = {
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };

    const onResetFilters = jasmine.createSpy('onResetFilters');

    const wrapper = shallow(
      <Results
        severities={severities}
        filter={filter}
        results={errors}
        onResetFilters={onResetFilters}
        />,
    );

    const items = wrapper.find('.list-empty-information');
    expect(items.length).toBe(1);
  });

  it('should show elements allowed by filters', () => {
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
    const filter = {
      severity: {
        warning: true,
      },
    };
    const severities = {
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };

    const onResetFilters = jasmine.createSpy('onResetFilters');

    const wrapper = shallow(
      <Results
        severities={severities}
        filter={filter}
        results={errors}
        onResetFilters={onResetFilters}
        />,
    );

    const items = wrapper.find('ul li');
    expect(items.length).toBe(1);
  });

  it('should show elements not mentioned by filters', () => {
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
    const filter = {
      severity: {
        failure: false,
      },
    };
    const severities = {
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };

    const onResetFilters = jasmine.createSpy('onResetFilters');

    const wrapper = shallow(
      <Results
        severities={severities}
        filter={filter}
        results={errors}
        onResetFilters={onResetFilters}
        />,
    );

    const items = wrapper.find('ul li');
    expect(items.length).toBe(1);
  });

  it('should sort the items correctly when sorting by line and col', () => {
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$.type',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$["http://schema.org/description"][0].type',
      },
    ];
    const tokenMap = {
      $: [0, 0],
      '$.type': [3, 9],
      '$["http://schema.org/description"]': [3, 7],
    };
    const severities = {
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };
    const sort = 'rowCol';

    const wrapper = shallow(<Results severities={severities} group={false} sort={sort} results={errors} tokenMap={tokenMap}/>);

    const items = wrapper.find('.result-line-col');

    expect(items.at(0).text()).toBe('Line 4, col 7');
    expect(items.at(1).text()).toBe('Line 4, col 9');
  });
  it('should sort the items correctly when sorting by severity', () => {
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$.type',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'notice',
        path: '$["http://schema.org/description"][0].type',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'failure',
        path: '$.name',
      },
    ];
    const tokenMap = {
      $: [0, 0],
      '$.type': [2, 9],
      '$["http://schema.org/description"]': [3, 7],
      '$.name': [7, 12],
    };
    const severities = {
      notice: {
        name: 'Notice',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
      failure: {
        name: 'Error',
        icon: 'check',
        iconCircle: 'check-circle',
      },
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };
    const sort = 'severity';

    const wrapper = shallow(<Results severities={severities} group={false} sort={sort} results={errors} tokenMap={tokenMap}/>);

    const items = wrapper.find('.result-line-col');

    expect(items.at(0).text()).toBe('Line 4, col 7');
    expect(items.at(1).text()).toBe('Line 8, col 12');
    expect(items.at(2).text()).toBe('Line 3, col 9');
  });
  it('should sort the items correctly when sorting by line, col', () => {
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$[0].type',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'notice',
        path: '$["http://schema.org/description"][0].type',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'failure',
        path: '$.name',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$[1].type',
      },
    ];
    const tokenMap = {
      $: [0, 0],
      '$[0].type': [22, 9],
      '$[1].type': [2, 9],
      '$["http://schema.org/description"]': [3, 7],
      '$.name': [7, 12],
    };
    const severities = {
      notice: {
        name: 'Notice',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
      failure: {
        name: 'Error',
        icon: 'check',
        iconCircle: 'check-circle',
      },
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };
    const sort = 'rowCol';

    const wrapper = shallow(<Results severities={severities} group={true} sort={sort} results={errors} tokenMap={tokenMap}/>);

    const items = wrapper.find('.result-item');

    expect(items.at(0).find('span.result-line-col').at(0).text()).toBe('Line 3, col 9');
    expect(items.at(0).find('.more-result-line-col-label').at(0).text()).not.toBe(null);
    expect(items.at(0).find('.more-result-line-col-label').at(0).text()).not.toBe('');
    expect(items.at(1).find('span.result-line-col').at(0).text()).toBe('Line 4, col 7');
    expect(items.at(2).find('span.result-line-col').at(0).text()).toBe('Line 8, col 12');
  });

  it('should sort the items correctly when sorting by severity', () => {
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$[0].type',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'notice',
        path: '$["http://schema.org/description"][0].type',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'failure',
        path: '$.name',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$[1].type',
      },
    ];
    const tokenMap = {
      $: [0, 0],
      '$[0].type': [2, 9],
      '$[1].type': [22, 9],
      '$["http://schema.org/description"]': [3, 7],
      '$.name': [7, 12],
    };
    const severities = {
      notice: {
        name: 'Notice',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
      failure: {
        name: 'Error',
        icon: 'check',
        iconCircle: 'check-circle',
      },
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };
    const sort = 'severity';

    const wrapper = shallow(<Results severities={severities} group={true} sort={sort} results={errors} tokenMap={tokenMap}/>);

    const items = wrapper.find('.result-item');

    expect(items.at(0).find('span.result-line-col').at(0).text()).toBe('Line 4, col 7');
    expect(items.at(1).find('span.result-line-col').at(0).text()).toBe('Line 8, col 12');
    expect(items.at(2).find('span.result-line-col').at(0).text()).toBe('Line 3, col 9');
    expect(items.at(2).find('.more-result-line-col-label').at(0).text()).not.toBe(null);
    expect(items.at(2).find('.more-result-line-col-label').at(0).text()).not.toBe('');
  });

  it('should expand the rowCols correctly when grouped', () => {
    const errors = [
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$[0].type',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'notice',
        path: '$["http://schema.org/description"][0].type',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'failure',
        path: '$.name',
      },
      {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$[1].type',
      },
    ];
    const tokenMap = {
      $: [0, 0],
      '$[0].type': [2, 9],
      '$[1].type': [22, 9],
      '$["http://schema.org/description"]': [3, 7],
      '$.name': [7, 12],
    };
    const severities = {
      notice: {
        name: 'Notice',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
      failure: {
        name: 'Error',
        icon: 'check',
        iconCircle: 'check-circle',
      },
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
    };
    const sort = 'severity';

    const wrapper = shallow(<Results severities={severities} group={true} sort={sort} results={errors} tokenMap={tokenMap}/>);

    const items = wrapper.find('.result-item');

    expect(items.at(0).find('span.result-line-col').at(0).text()).toBe('Line 4, col 7');
    expect(items.at(1).find('span.result-line-col').at(0).text()).toBe('Line 8, col 12');
    expect(items.at(2).find('span.result-line-col').at(0).text()).toBe('Line 3, col 9');
    expect(items.at(2).find('.more-result-line-col-label').at(0).text()).not.toBe(null);
    expect(items.at(2).find('.more-result-line-col-label').at(0).text()).not.toBe('');

    items.at(2).find('.more-result-line-col-label').simulate('click');

    expect(wrapper.state('showPaths')).toEqual(['missing_required_field-warning-type-2:9']);

    expect(wrapper.find('li.result-line-col').at(0).text()).toBe('Line 23, col 9');
  });
});
