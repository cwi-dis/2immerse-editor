/// <reference types="jest" />

import { List } from "immutable";
import reducer, { Chapter, ChapterState, initialState } from "../../js/editor/reducers/chapters";

describe("Chapters reducer", () => {
  it("should return the initial state on an unknown action", () => {
    expect(
      reducer(undefined, { type: "" })
    ).toEqual(initialState);
  });

  it("should return the given state on an unknown action", () => {
    const state: ChapterState = List([
      new Chapter({ id: "chapterId" })
    ]);

    expect(
      reducer(state, { type: "" })
    ).toEqual(state);
  });

  it("should add a chapter before the existing one on ADD_CHAPTER_BEFORE", () => {
    const state: ChapterState = List([
      new Chapter({ id: "chapter1" })
    ]);

    const transformedState = reducer(
      state,
      { type: "ADD_CHAPTER_BEFORE", payload: { accessPath: [0] }} as any
    )

    expect(transformedState.count()).toEqual(2);
    expect(transformedState.get(0)).toBeInstanceOf(Chapter);
    expect(transformedState.get(1)).toBe(state.get(0));
  });

  it("should add a chapter before the last one on ADD_CHAPTER_BEFORE", () => {
    const state: ChapterState = List([
      new Chapter({ id: "chapter1" }),
      new Chapter({ id: "chapter2" })
    ]);

    const transformedState = reducer(
      state,
      { type: "ADD_CHAPTER_BEFORE", payload: { accessPath: [1] }} as any
    )

    expect(transformedState.count()).toEqual(3);

    expect(transformedState.get(0)).toBe(state.get(0));
    expect(transformedState.get(1)).toBeInstanceOf(Chapter);
    expect(transformedState.get(2)).toBe(state.get(1));
  });

  it("should add a chapter before the last one on a deeper level on ADD_CHAPTER_BEFORE", () => {
    const state: ChapterState = List([
      new Chapter({id: "chapter1", children: List([
        new Chapter({ id: "chapter1.1" }),
        new Chapter({ id: "chapter1.2" })
      ])})
    ]);

    const transformedState = reducer(
      state,
      { type: "ADD_CHAPTER_BEFORE", payload: { accessPath: [0, 1] }} as any
    )

    expect(transformedState.count()).toEqual(1);

    const firstLevel = transformedState.get(0).children;
    expect(firstLevel.count()).toEqual(3);

    expect(firstLevel.get(0)).toBe(state.get(0).children.get(0));
    expect(firstLevel.get(1)).toBeInstanceOf(Chapter);
    expect(firstLevel.get(2)).toBe(state.get(0).children.get(1));
  });

  it("should add a chapter after the last one on ADD_CHAPTER_AFTER", () => {
    const state: ChapterState = List([
      new Chapter({ id: "chapter1" }),
      new Chapter({ id: "chapter2" })
    ]);

    const transformedState = reducer(
      state,
      { type: "ADD_CHAPTER_AFTER", payload: { accessPath: [0] }} as any
    )

    expect(transformedState.count()).toEqual(3);

    expect(transformedState.get(0)).toBe(state.get(0));
    expect(transformedState.get(1)).toBeInstanceOf(Chapter);
    expect(transformedState.get(2)).toBe(state.get(1));
  });

  it("should add a chapter after the existing one on ADD_CHAPTER_AFTER", () => {
    const state: ChapterState = List([
      new Chapter({ id: "chapter1" })
    ]);

    const transformedState = reducer(
      state,
      { type: "ADD_CHAPTER_AFTER", payload: { accessPath: [0] }} as any
    )

    expect(transformedState.count()).toEqual(2);
    expect(transformedState.get(0)).toBe(state.get(0));
    expect(transformedState.get(1)).toBeInstanceOf(Chapter);
  });

  it("should add a chapter after the first one on a deeper level on ADD_CHAPTER_AFTER", () => {
    const state: ChapterState = List([
      new Chapter({id: "chapter1", children: List([
        new Chapter({ id: "chapter1.1" }),
        new Chapter({ id: "chapter1.2" })
      ])})
    ]);

    const transformedState = reducer(
      state,
      { type: "ADD_CHAPTER_AFTER", payload: { accessPath: [0, 0] }} as any
    )

    expect(transformedState.count()).toEqual(1);

    const firstLevel = transformedState.get(0).children;
    expect(firstLevel.count()).toEqual(3);

    expect(firstLevel.get(0)).toBe(state.get(0).children.get(0));
    expect(firstLevel.get(1)).toBeInstanceOf(Chapter);
    expect(firstLevel.get(2)).toBe(state.get(0).children.get(1));
  });
});
