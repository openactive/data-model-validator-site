import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

import LoadingOverlay from './LoadingOverlay.jsx';

describe('LoadingOverlay', () => {
  it('can render without error', () => {
    let component;

    const renderer = new ShallowRenderer();
    renderer.render(<LoadingOverlay />);

    // Render into a document fragment and return the full component instance.
    expect(() => {
      component = renderer.getRenderOutput();
    }).not.toThrow();

    expect(component.type).toBe('div');
    expect(component.props.children.type.displayName).toBe('FontAwesomeIcon');
  });
});
