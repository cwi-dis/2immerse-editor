/// <reference types="jest" />

import * as React from "react";
import { configure, mount } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

import Layout from "../../js/editor/components/layout";
import MenuBar from "../../js/editor/components/menu_bar";
import CurrentVersion from "../../js/editor/components/current_version";

const Dummy: React.SFC<{}> = () => {
  return null;
};

describe("Component <Layout />", () => {
  it("should render a <MenuBar /> component", () => {
    const layout = mount(<Layout><Dummy /></Layout>);

    expect(layout.find(MenuBar).length).toEqual(1);
    expect(layout.find(".wrapper").childAt(0).is(MenuBar)).toBeTruthy();
  });

  it("should render a <CurrentVersion /> component", () => {
    const layout = mount(<Layout><Dummy /></Layout>);

    expect(layout.find(CurrentVersion).length).toEqual(1);
    expect(layout.find(".wrapper").childAt(2).is(CurrentVersion)).toBeTruthy();
  });

  it("should render components passed in as children in addition to <MenuBar /> and <CurrentVersion />", () => {
    const layout = mount(
      <Layout>
        <Dummy />
      </Layout>
    );

    expect(layout.find(".wrapper").childAt(1).is(Dummy)).toBeTruthy();
    expect(layout.find(".wrapper").children().length).toEqual(3);
  });
});
