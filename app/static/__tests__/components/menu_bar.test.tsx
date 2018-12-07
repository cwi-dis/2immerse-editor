/// <reference types="jest" />

import * as React from "react";
import { NavLink } from "react-router-dom";
import { shallow } from "enzyme";

import MenuBar from "../../js/editor/components/menu_bar";

describe("Component <MenuBar />", () => {
  it("should contain three <Link/> components", () => {
    const menuBar = shallow(<MenuBar />);
    expect(menuBar.find(NavLink).length).toEqual(3);
  });

  it("should contain a route with label 'Home' at the application root", () => {
    const menuBar = shallow(<MenuBar />);
    const linkProps = menuBar.find(NavLink).at(0).props();

    expect(linkProps.to).toEqual("/");
    expect(linkProps.children.toString()).toEqual("Home");
  });

  it("should contain a route with label 'Design Layout'", () => {
    const menuBar = shallow(<MenuBar />);
    const linkProps = menuBar.find(NavLink).at(1).props();

    expect(linkProps.to).toEqual("/layout");
    expect(linkProps.children.toString()).toEqual("Design Layout");
  });

  it("should contain a route with label 'Author Program'", () => {
    const menuBar = shallow(<MenuBar />);
    const linkProps = menuBar.find(NavLink).at(2).props();

    expect(linkProps.to).toEqual("/program");
    expect(linkProps.children.toString()).toEqual("Author Program");
  });
});
