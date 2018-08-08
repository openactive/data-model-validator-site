import React from 'react';
import { shallow } from 'enzyme';

import VersionHelper from '../helpers/version-helper';
import SpecVersion from './SpecVersion.jsx';

describe('<SpecVersion />', () => {
  it('can render without error', () => {
    let wrapper;

    spyOn(VersionHelper, 'getVersions').and.callFake(() => ({
      latest: '2.0',
      '2.0': '2.0',
      '3.0': '3.0',
    }));

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<SpecVersion version="latest"/>);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
  it('should render nothing when there are not enough versions', () => {
    spyOn(VersionHelper, 'getVersions').and.callFake(() => ({
      latest: '2.0',
      '2.0': '2.0',
    }));

    const wrapper = shallow(<SpecVersion version="latest"/>);
    expect(wrapper.html()).toBe(null);
  });
  it('should call an event handler when changing a version', () => {
    spyOn(VersionHelper, 'getVersions').and.callFake(() => ({
      latest: '2.0',
      '2.0': '2.0',
      '3.0': '3.0',
    }));

    const onChange = jasmine.createSpy('onChange');

    const wrapper = shallow(<SpecVersion version="latest" onVersionClick={onChange}/>);

    wrapper.find('.form-check').at(0).simulate('click');

    expect(onChange).toHaveBeenCalledWith('3.0');
  });
});
