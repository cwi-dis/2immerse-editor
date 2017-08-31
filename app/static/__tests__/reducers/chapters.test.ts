/// <reference types="jest" />

import { List } from "immutable";
import reducer, { Chapter, ChapterState, initialState } from "../../js/editor/reducers/chapters";

describe("Chapter class", () => {
  it("should instantiate a new object with the default attributes", () => {
    const chapter = new Chapter();

    expect(chapter.id).toEqual("");
    expect(chapter.name).toEqual(null);
    expect(chapter.masterLayouts).toEqual(List());
    expect(chapter.children).toEqual(List());
  });

  it("should instantiate a new object with some given attributes", () => {
    const chapter = new Chapter({id: "chapter1", name: "chapter name"});

    expect(chapter.id).toEqual("chapter1");
    expect(chapter.name).toEqual("chapter name");
    expect(chapter.masterLayouts).toEqual(List());
    expect(chapter.children).toEqual(List());
  });

  it("should instantiate a new object with all given attributes", () => {
    const chapter = new Chapter({
      id: "chapter1",
      name: "another chapter name",
      masterLayouts: List(["masterLayout"]),
      children: List([new Chapter({id: "chapter1.1"})])
    });

    expect(chapter.id).toEqual("chapter1");
    expect(chapter.name).toEqual("another chapter name");
    expect(chapter.masterLayouts).toEqual(List(["masterLayout"]));
    expect(chapter.children).toEqual(List([new Chapter({id: "chapter1.1"})]));
  });
});

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
    );

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
    );

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
    );

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
    );

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
    );

    expect(transformedState.count()).toEqual(2);
    expect(transformedState.get(0)).toBe(state.get(0));
    expect(transformedState.get(1)).toBeInstanceOf(Chapter);
  });

  it("should add a chapter after the existing one on ADD_CHAPTER_AFTER with out of bounds index", () => {
    const state: ChapterState = List([
      new Chapter({ id: "chapter1" })
    ]);

    const transformedState1 = reducer(
      state,
      { type: "ADD_CHAPTER_AFTER", payload: { accessPath: [1] }} as any
    );

    expect(transformedState1.count()).toEqual(2);
    expect(transformedState1.get(0)).toBe(state.get(0));
    expect(transformedState1.get(1)).toBeInstanceOf(Chapter);

    const transformedState2 = reducer(
      state,
      { type: "ADD_CHAPTER_AFTER", payload: { accessPath: [10] }} as any
    );

    expect(transformedState2.count()).toEqual(2);
    expect(transformedState2.get(0)).toBe(state.get(0));
    expect(transformedState2.get(1)).toBeInstanceOf(Chapter);
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
    );

    expect(transformedState.count()).toEqual(1);

    const firstLevel = transformedState.get(0).children;
    expect(firstLevel.count()).toEqual(3);

    expect(firstLevel.get(0)).toBe(state.get(0).children.get(0));
    expect(firstLevel.get(1)).toBeInstanceOf(Chapter);
    expect(firstLevel.get(2)).toBe(state.get(0).children.get(1));
  });

  it("should rename an existing chapter on RENAME_CHAPTER", () => {
    const state: ChapterState = List([
      new Chapter({ id: "chapter1" })
    ]);

    const transformedState = reducer(
      state,
      { type: "RENAME_CHAPTER", payload: { accessPath: [0], name: "new name" }} as any
    );

    expect(transformedState.count()).toEqual(1);
    expect(transformedState.get(0).name).toEqual("new name");
  });

  it("should assign a master layout to a chapter on ASSIGN_MASTER", () => {
    const state: ChapterState = List([
      new Chapter({ id: "chapter1" })
    ]);

    const transformedState = reducer(
      state,
      { type: "ASSIGN_MASTER", payload: { accessPath: [0], masterId: "master1" }} as any
    );

    expect(transformedState.count()).toEqual(1);
    expect(transformedState.get(0).masterLayouts.count()).toEqual(1);
    expect(transformedState.get(0).masterLayouts.get(0)).toEqual("master1");
  });

  it("should add a new node as child of a leaf node on ADD_CHAPTER_CHILD", () => {
    const state: ChapterState = List([
      new Chapter({id: "chapter1", children: List([
        new Chapter({id: "chapter1.1"})
      ])})
    ]);

    const transformedState = reducer(
      state,
      { type: "ADD_CHAPTER_CHILD", payload: { accessPath: [0, 0] }} as any
    );
    const chapterChildren = transformedState.get(0).children.get(0).children;

    expect(chapterChildren.count()).toEqual(1);
    expect(chapterChildren.get(0)).toBeInstanceOf(Chapter);
    expect(chapterChildren.get(0).children).toEqual(List());
  });

  it("should insert a new node between two existing nodes on ADD_CHAPTER_CHILD", () => {
    const state: ChapterState = List([
      new Chapter({id: "chapter1", children: List([
        new Chapter({id: "chapter1.1"})
      ])})
    ]);

    const transformedState = reducer(
      state,
      { type: "ADD_CHAPTER_CHILD", payload: { accessPath: [0] }} as any
    );

    expect(transformedState.get(0).id).toEqual("chapter1");

    const chapterChildren = transformedState.get(0).children;
    expect(chapterChildren.count()).toEqual(1);
    expect(chapterChildren.get(0)).toBeInstanceOf(Chapter);

    expect(chapterChildren.get(0).children.count()).toEqual(1);
    expect(chapterChildren.get(0).children.get(0).id).toEqual("chapter1.1");
  });
});
