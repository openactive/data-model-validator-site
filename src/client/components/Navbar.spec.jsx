import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

import Navbar from './Navbar.jsx';

describe('Navbar', () => {
  it('can render without error', () => {
    let component;

    const renderer = new ShallowRenderer();
    renderer.render(<Navbar />);

    // Render into a document fragment and return the full component instance.
    expect(() => {
      component = renderer.getRenderOutput();
    }).not.toThrow();

    expect(component.type).toBe('nav');
    expect(component.props.children.length).toBe(2);
  });
});
