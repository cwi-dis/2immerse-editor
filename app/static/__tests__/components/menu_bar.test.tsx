/// <reference types="jest" />

import * as React from "react";
import { Link } from "react-router";
import { configure, mount } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

import MenuBar from "../../js/editor/components/menu_bar";

describe("Component <MenuBar />", () => {
  it("should contain three <Link/> components", () => {
    const menuBar = mount(<MenuBar />);
    expect(menuBar.find(Link).length).toEqual(3);
  });

  it("should contain a route with label 'Design Layout' at the application root", () => {
    const menuBar = mount(<MenuBar />);
    const linkProps = menuBar.find(Link).at(0).props();

    expect(linkProps.to).toEqual("/");
    expect(linkProps.children.toString()).toEqual("Design Layout");
  });

  it("should contain a route with label 'Manage Masters'", () => {
    const menuBar = mount(<MenuBar />);
    const linkProps = menuBar.find(Link).at(1).props();

    expect(linkProps.to).toEqual("/masters");
    expect(linkProps.children.toString()).toEqual("Manage Masters");
  });

  it("should contain a route with label 'Author Program'", () => {
    const menuBar = mount(<MenuBar />);
    const linkProps = menuBar.find(Link).at(2).props();

    expect(linkProps.to).toEqual("/program");
    expect(linkProps.children.toString()).toEqual("Author Program");
  });
});
