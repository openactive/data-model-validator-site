import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

import HelpText from './HelpText.jsx';

describe('HelpText', () => {
  it('can render without error', () => {
    let component;

    const renderer = new ShallowRenderer();
    renderer.render(<HelpText />);

    // Render into a document fragment and return the full component instance.
    expect(() => {
      component = renderer.getRenderOutput();
    }).not.toThrow();

    expect(component.type).toBe('div');
    expect(component.props.children.length).toBe(2);
  });
});
