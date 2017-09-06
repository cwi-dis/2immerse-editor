/// <reference types="jest" />

import * as React from "react";
import { mount } from "enzyme";

import ContextMenu, { ContextMenuDivider, ContextMenuEntry } from "../../js/editor/components/context_menu";

describe("Component <ContextMenu/>", () => {
  it("should not render anything with 'visible' set to false", () => {
    const contextMenu = mount(
      <ContextMenu visible={false} x={0} y={0}>
        <ContextMenuDivider/>
      </ContextMenu>
    );

    expect(contextMenu.isEmptyRender()).toBeTruthy();
  });

  it("should render a context menu with a single divider with 'visible' set to true", () => {
    const contextMenu = mount(
      <ContextMenu visible={true} x={0} y={0}>
        <ContextMenuDivider/>
      </ContextMenu>
    );

    expect(contextMenu.isEmptyRender()).toBeFalsy();
    expect(contextMenu.find(".divider").length).toEqual(1);
  });

  it("should render a context-menu at the given position", () => {
    const contextMenu = mount(
      <ContextMenu visible={true} x={321} y={123}>
        <ContextMenuDivider/>
      </ContextMenu>
    );

    expect(contextMenu.isEmptyRender()).toBeFalsy();

    const rootDiv = contextMenu.find("div").first();

    expect(rootDiv.props().style.position).toEqual("absolute");
    expect(rootDiv.props().style.left).toEqual(321);
    expect(rootDiv.props().style.top).toEqual(123);
  });
});
