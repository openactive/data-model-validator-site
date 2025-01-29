import React from 'react';
import Highlight from 'react-highlight';
import { Link } from 'react-router-dom';

const MyLink = (props) => {
  const { children } = props;
  const newProps = { ...props };
  delete newProps.children;
  if (newProps.href.match(/^https:\/\/validator\.openactive\.io/)) {
    return (
      <Link to={newProps.href.replace(/^https:\/\/validator\.openactive\.io/, '')}>{children}</Link>
    );
  }
  return (
    <a {...newProps}>{children}</a>
  );
};

const MyHighlight = (props) => {
  const { children } = props;
  const newProps = { ...props };
  newProps.element = 'pre';
  delete newProps.children;
  return (
    <Highlight {...newProps}>{children}</Highlight>
  );
};

export default class MarkdownHelper {
  static getOptions() {
    /*
    // NOTE: This code was removed to fix an issue with duplicate markdown appearing, and can be deleted if the issue does not persist

    if (typeof this.index === 'undefined') {
      this.index = 0;
    }
    this.index += 1;
    */
    return {
      overrides: {
        a: {
          component: MyLink,
          props: {
            target: '_blank',
            rel: 'noopener',
          },
        },
        pre: {
          component: MyHighlight,
          props: {
            className: 'json',
            // key: this.index, // NOTE: This code was removed to fix an issue with duplicate markdown appearing, and can be deleted if the issue does not persist
          },
        },
      },
      forceBlock: true,
    };
  }
}
