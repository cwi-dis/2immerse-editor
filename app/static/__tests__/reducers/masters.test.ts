/// <reference types="jest" />

import { List } from "immutable";
import reducer, { Master, MasterState } from "../../js/editor/reducers/masters";

describe("Master class", () => {
  it("should instantiate a new object with the default attributes", () => {
    const master = new Master();

    expect(master.id).toEqual("");
    expect(master.name).toEqual("");
    expect(master.placedComponents).toEqual(List());
  });

  it("should instantiate a new object with some given attributes", () => {
    const master = new Master({id: "masterId", name: "master layout"});

    expect(master.id).toEqual("masterId");
    expect(master.name).toEqual("master layout");
    expect(master.placedComponents).toEqual(List());
  });

  it("should instantiate a new object with all given attributes", () => {
    const chapter = new Master({
      id: "master1",
      name: "another master name",
      placedComponents: List([{
        screen: "screen1",
        region: "region1",
        component: "some component" 
      }]),
    });

    expect(chapter.id).toEqual("master1");
    expect(chapter.name).toEqual("another master name");

    expect(chapter.placedComponents.count()).toEqual(1);
    expect(chapter.placedComponents.get(0).screen).toEqual("screen1");
  });
});
