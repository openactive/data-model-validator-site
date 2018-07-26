import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

import Results from './Results.jsx';

describe('Results', () => {
  it('can render without error', () => {
    let component;

    const renderer = new ShallowRenderer();
    renderer.render(<Results results={[]}/>);

    // Render into a document fragment and return the full component instance.
    expect(() => {
      component = renderer.getRenderOutput();
    }).not.toThrow();

    expect(component.type).toBe('div');
    expect(component.props.children.length).toBe(2);
    // The buttons
    expect(component.props.children[1].length).toBe(4);
  });
});
