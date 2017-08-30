/// <reference types="jest" />

import { List } from "immutable";
import reducer, { Chapter, ChapterState, initialState } from "../../js/editor/reducers/chapters";

describe("Chapters reducer", () => {
  it("should return the initial state on an unknown action", () => {
    expect(
      reducer(undefined, { type: "SOME_ACTION" })
    ).toEqual(initialState);
  });

  it("should return the given state on an unknown action", () => {
    const state: ChapterState = List([
      new Chapter({ id: "chapterId" })
    ]);

    expect(
      reducer(state, { type: "SOME_ACTION" })
    ).toEqual(state);
  });
});
