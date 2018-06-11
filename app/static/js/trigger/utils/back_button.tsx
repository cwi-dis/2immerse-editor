import * as React from "react";

function asBackButton<P>(LinkComponent: React.ComponentType<P> | string) {
  return function BackButton<P>(props: P) {
    return (
      <LinkComponent className="back-button" {...props}>
        <span className="icon is-large">
          <i className="fa fa-arrow-left fas fa-lg" />
        </span>
      </LinkComponent>
    );
  };
}

export default asBackButton;
