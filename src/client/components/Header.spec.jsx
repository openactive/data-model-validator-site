import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

import Header from './Header.jsx';

describe('Header', () => {
  it('can render without error', () => {
    let component;

    const renderer = new ShallowRenderer();
    renderer.render(<Header />);

    // Render into a document fragment and return the full component instance.
    expect(() => {
      component = renderer.getRenderOutput();
    }).not.toThrow();

    expect(component.type).toBe('header');
    expect(component.props.children.type).toBe('nav');
    expect(component.props.children.props.children.length).toBe(3);
  });
});
