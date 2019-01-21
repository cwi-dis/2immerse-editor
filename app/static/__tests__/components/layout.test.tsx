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

/// <reference types="jest" />

import * as React from "react";
import { shallow } from "enzyme";

import Layout from "../../js/editor/components/layout";
import MenuBar from "../../js/editor/components/menu_bar";
import CurrentVersion from "../../js/editor/components/current_version";

const Dummy: React.SFC<{}> = () => {
  return null;
};

describe("Component <Layout />", () => {
  it("should render a <MenuBar /> component", () => {
    const layout = shallow(<Layout><Dummy /></Layout>);

    expect(layout.find(MenuBar).length).toEqual(1);
    expect(layout.find(".wrapper").childAt(0).is(MenuBar)).toBeTruthy();
  });

  it("should render a <CurrentVersion /> component", () => {
    const layout = shallow(<Layout><Dummy /></Layout>);

    expect(layout.find(CurrentVersion).length).toEqual(1);
    expect(layout.find(".wrapper").childAt(2).is(CurrentVersion)).toBeTruthy();
  });

  it("should render components passed in as children in addition to <MenuBar /> and <CurrentVersion />", () => {
    const layout = shallow(
      <Layout>
        <Dummy />
      </Layout>
    );

    expect(layout.find(".wrapper").childAt(1).is(Dummy)).toBeTruthy();
    expect(layout.find(".wrapper").children().length).toEqual(3);
  });
});
