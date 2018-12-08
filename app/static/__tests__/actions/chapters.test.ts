/// <reference types="jest" />

import * as actionTypes from "../../js/editor/actions/chapters";
import { actionCreators } from "../../js/editor/actions/chapters";
import { List } from "immutable";
import { Chapter } from "../../js/editor/reducers/chapters";

describe("Chapter actions", () => {
  it("should create a LOAD_CHAPTER_TREE action", () => {
    const tree = List([new Chapter({
      id: "chapter1",
      name: "Root Chapter"
    })]);

    const expected: actionTypes.LOAD_CHAPTER_TREE = {
      type: "LOAD_CHAPTER_TREE",
      payload: {
        tree
      }
    };

    expect(actionCreators.loadChapterTree(tree)).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_BEFORE action", () => {
    const expected: actionTypes.ADD_CHAPTER_BEFORE = {
      type: "ADD_CHAPTER_BEFORE",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterBefore([0, 1, 0])).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_BEFORE action with predefined ID", () => {
    const expected: actionTypes.ADD_CHAPTER_BEFORE = {
      type: "ADD_CHAPTER_BEFORE",
      payload: {
        accessPath: [0, 1, 0],
        id: "chapter1"
      }
    };

    expect(actionCreators.addChapterBefore([0, 1, 0], "chapter1")).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_AFTER action", () => {
    const expected: actionTypes.ADD_CHAPTER_AFTER = {
      type: "ADD_CHAPTER_AFTER",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterAfter([0, 1, 0])).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_AFTER action with predefined ID", () => {
    const expected: actionTypes.ADD_CHAPTER_AFTER = {
      type: "ADD_CHAPTER_AFTER",
      payload: {
        accessPath: [0, 1, 0],
        id: "chapter1"
      }
    };

    expect(actionCreators.addChapterAfter([0, 1, 0], "chapter1")).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_CHILD action", () => {
    const expected: actionTypes.ADD_CHAPTER_CHILD = {
      type: "ADD_CHAPTER_CHILD",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterChild([0, 1, 0])).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_CHILD action with predefined ID", () => {
    const expected: actionTypes.ADD_CHAPTER_CHILD = {
      type: "ADD_CHAPTER_CHILD",
      payload: {
        accessPath: [0, 1, 0],
        id: "chapter1"
      }
    };

    expect(actionCreators.addChapterChild([0, 1, 0], "chapter1")).toEqual(expected);
  });

  it("should create an REMOVE_CHAPTER action", () => {
    const expected: actionTypes.REMOVE_CHAPTER = {
      type: "REMOVE_CHAPTER",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.removeChapter([0, 1, 0])).toEqual(expected);
  });

  it("should create an RENAME_CHAPTER action", () => {
    const expected: actionTypes.RENAME_CHAPTER = {
      type: "RENAME_CHAPTER",
      payload: {
        accessPath: [0, 1, 0],
        name: "new chapter name"
      }
    };

    expect(actionCreators.renameChapter([0, 1, 0], "new chapter name")).toEqual(expected);
  });
});
