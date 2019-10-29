import React from 'react';
import { shallow } from 'enzyme';

import VersionHelper from '../helpers/version-helper';
import Samples from './Samples.jsx';

describe('<Samples />', () => {
  it('can render without error', () => {
    let wrapper;

    spyOn(VersionHelper, 'getVersionExamples').and.callFake(() => ([
      {
        name: 'Test group',
        exampleList: [
          {
            file: 'test.json',
            name: 'Test',
          },
        ],
      },
    ]));

    // Render into a document fragment and return the full component instance.
    expect(() => {
      wrapper = shallow(<Samples version="latest"/>);
    }).not.toThrow();

    expect(wrapper.type()).toBe('div');
  });
});
