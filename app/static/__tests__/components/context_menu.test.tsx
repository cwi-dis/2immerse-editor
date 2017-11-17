/// <reference types="jest" />

import * as React from "react";
import { mount } from "enzyme";
import { spy } from "sinon";

import ContextMenu, { ContextMenuDivider, ContextMenuEntry } from "../../js/editor/components/context_menu";

describe("Component <ContextMenu />", () => {
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

  it("should call the component's onItemClicked callback when clicking an entry", () => {
    const itemClicked = spy();
    const contextMenu = mount(
      <ContextMenu visible={true} x={321} y={123} onItemClicked={itemClicked}>
        <ContextMenuEntry name="test" callback={() => {}} />
      </ContextMenu>
    );

    contextMenu.find(".entry").first().simulate("click");
    expect(itemClicked.calledOnce).toBeTruthy();
  });

  it("should not change when the default onItemClicked is invoked", () => {
    const contextMenu = mount(
      <ContextMenu visible={true} x={321} y={123}>
        <ContextMenuEntry name="test" callback={() => {}} />
      </ContextMenu>
    );

    const before = contextMenu.html();
    contextMenu.find(".entry").first().simulate("click");

    expect(contextMenu.html()).toEqual(before);
  });

  it("should trigger the entry's and the ContextMenu's callback when an entry is clicked", () => {
    const onClick = spy();
    const onItemClick = spy();

    const contextMenu = mount(
      <ContextMenu visible={true} x={0} y={0} onItemClicked={onItemClick}>
        <ContextMenuEntry name="Some entry" callback={onClick} />
      </ContextMenu>
    );

    contextMenu.find(".entry").first().simulate("click");

    expect(onClick.calledOnce).toBeTruthy();
    expect(onItemClick.calledOnce).toBeTruthy();
  });
});

describe("Component <ContextMenuEntry />", () => {
  it("should render its name", () => {
    const contextMenuEntry = mount(
      <ContextMenuEntry name="Some entry" callback={() => {}} />
    );

    expect(contextMenuEntry.text()).toEqual("Some entry");
  });

  it("should initialise with state.selected being false", () => {
    const contextMenuEntry = mount(
      <ContextMenuEntry name="Some entry" callback={() => {}} />
    );

    expect(contextMenuEntry.state().selected).toBeFalsy();
  });

  it("should initialise the element's style correctly", () => {
    const contextMenuEntry = mount(
      <ContextMenuEntry name="Some entry" callback={() => {}} />
    );

    const container = contextMenuEntry.find("div").first();

    expect(container.props().style.color).toEqual("#000000");
    expect(container.props().style.backgroundColor).toEqual("transparent");
  });

  it("should change state.selected to true on mouseover", () => {
    const contextMenuEntry = mount(
      <ContextMenuEntry name="Some entry" callback={() => {}} />
    );

    expect(contextMenuEntry.state().selected).toBeFalsy();
    contextMenuEntry.find("div").first().simulate("mouseover");
    expect(contextMenuEntry.state().selected).toBeTruthy();
  });

  it("should update the element's style on mouseover", () => {
    const contextMenuEntry = mount(
      <ContextMenuEntry name="Some entry" callback={() => {}} />
    );

    contextMenuEntry.find("div").first().simulate("mouseover");
    contextMenuEntry.update();

    const container = contextMenuEntry.find("div").first();

    expect(container.props().style.color).toEqual("#FFFFFF");
    expect(container.props().style.backgroundColor).toEqual("#007ACC");
  });

  it("should reset state.selected to false on mouseout", () => {
    const contextMenuEntry = mount(
      <ContextMenuEntry name="Some entry" callback={() => {}} />
    );

    expect(contextMenuEntry.state().selected).toBeFalsy();

    contextMenuEntry.find("div").first().simulate("mouseover");
    expect(contextMenuEntry.state().selected).toBeTruthy();

    contextMenuEntry.find("div").first().simulate("mouseout");
    expect(contextMenuEntry.state().selected).toBeFalsy();
  });

  it("should reset the element's style to default on mouseout", () => {
    const contextMenuEntry = mount(
      <ContextMenuEntry name="Some entry" callback={() => {}} />
    );

    const beforeContainer = contextMenuEntry.find("div").first();
    const beforeStyle = beforeContainer.props().style;

    beforeContainer.simulate("mouseover");

    let afterContainer = contextMenuEntry.find("div").first();
    expect(afterContainer.props().style).not.toEqual(beforeStyle);

    afterContainer.simulate("mouseout");
    afterContainer = contextMenuEntry.find("div").first();

    expect(afterContainer.props().style).toEqual(beforeStyle);
  });

  it("should trigger the element's callback when clicked", () => {
    const onClick = spy();
    const contextMenuEntry = mount(
      <ContextMenuEntry name="Some entry" callback={onClick} />
    );

    contextMenuEntry.find("div").first().simulate("click");
    expect(onClick.calledOnce).toBeTruthy();
  });
});

describe("Component <ContextMenuDivider />", () => {
  it("should render a divider", () => {
    const contextMenuDivider = mount(<ContextMenuDivider />);
    const container = contextMenuDivider.find("div").first();

    expect(container.props().className).toEqual("divider");

    expect(container.props().style.borderTop).toEqual("1px solid #BBBBBB");
    expect(container.props().style.width).toEqual("100%");
    expect(container.props().style.height).toEqual(2);
  });
});
