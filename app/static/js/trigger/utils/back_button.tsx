/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";

function asBackButton<P>(WrappedComponent: React.ComponentType<P> | string) {
  // Higher-order component for wrapping a back-arrow in a custom link component
  return class BackButton extends React.Component<P> {
    render() {
      return (
        <WrappedComponent className="back-button" {...this.props}>
          <span className="icon is-large">
            <i className="fa fa-arrow-left fas fa-lg" />
          </span>
        </WrappedComponent>
      );
    }
  };
}

export default asBackButton;
