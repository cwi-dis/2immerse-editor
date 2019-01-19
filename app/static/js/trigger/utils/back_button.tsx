import * as React from "react";

function asBackButton<P>(LinkComponent: React.ComponentType<P> | string) {
  // Higher-order component for wrapping a back-arrow in a custom link component
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
