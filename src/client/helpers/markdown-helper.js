import React from 'react';
import Highlight from 'react-highlight';
import { Link } from 'react-router-dom';

const MyLink = (props) => {
  const { children } = props;
  const newProps = Object.assign({}, props);
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

export default class MarkdownHelper {
  static getOptions() {
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
          component: Highlight,
          className: 'json',
        },
      },
      forceBlock: true,
    };
  }
}
