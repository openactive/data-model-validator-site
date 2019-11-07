import React from 'react';
import { shallow } from 'enzyme';

import VersionHelper from '../helpers/version-helper';
import ValidationMode from './ValidationMode.jsx';

const fixtureMetadata = {
  validationModeGroups: [
    {
      name: 'Opportunity Data Publishing',
      validationModeList: [
        {
          validationMode: 'RPDEFeed',
          name: 'RPDE Feed',
        },
      ],
    },
    {
      name: 'Open Booking API',
      validationModeList: [
        {
          validationMode: 'C1Request',
          name: 'C1 Request',
        },
        {
          validationMode: 'C1Response',
          name: 'C1 Response',
        },
        {
          validationMode: 'C2Request',
          name: 'C2 Request',
        },
      ],
    },
  ],
};

describe('<ValidationMode />', () => {
  it('can render without error', () => {
    let wrapper;

    spyOn(VersionHelper, 'getVersionMetaData').and.callFake(() => fixtureMetadata);

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<ValidationMode version="latest" validationMode='RPDEFeed'/>);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });

  it('should call an event handler when changing a version', () => {
    spyOn(VersionHelper, 'getVersionMetaData').and.callFake(() => fixtureMetadata);

    const onChange = jasmine.createSpy('onChange');

    const wrapper = shallow(<ValidationMode version="latest" validationMode='RPDEFeed' onValidationModeClick={onChange}/>);

    wrapper.find('.form-check').at(1).simulate('click');

    expect(onChange).toHaveBeenCalledWith('C1Request');
  });
});
