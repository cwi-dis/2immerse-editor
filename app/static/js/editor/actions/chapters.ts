import { ActionCreatorsMapObject } from "redux";
import { PayloadAction } from "../util";
import { ChapterState } from "../reducers/chapters";

export type LOAD_CHAPTER_TREE = PayloadAction<"LOAD_CHAPTER_TREE", { tree: ChapterState }>;
function loadChapterTree(tree: ChapterState): LOAD_CHAPTER_TREE {
  return {
    type: "LOAD_CHAPTER_TREE",
    payload: {
      tree
    }
  };
}

export type ADD_CHAPTER_BEFORE = PayloadAction<"ADD_CHAPTER_BEFORE", {accessPath: Array<number>}>;
function addChapterBefore(accessPath: Array<number>): ADD_CHAPTER_BEFORE {
  return {
    type: "ADD_CHAPTER_BEFORE",
    payload: {
      accessPath
    }
  };
}

export type ADD_CHAPTER_AFTER = PayloadAction<"ADD_CHAPTER_AFTER", {accessPath: Array<number>}>;
function addChapterAfter(accessPath: Array<number>): ADD_CHAPTER_AFTER {
  return {
    type: "ADD_CHAPTER_AFTER",
    payload: {
      accessPath
    }
  };
}

export type ADD_CHAPTER_CHILD = PayloadAction<"ADD_CHAPTER_CHILD", {accessPath: Array<number>}>;
function addChapterChild(accessPath: Array<number>): ADD_CHAPTER_CHILD {
  return {
    type: "ADD_CHAPTER_CHILD",
    payload: {
      accessPath
    }
  };
}

export type RENAME_CHAPTER = PayloadAction<"RENAME_CHAPTER", {accessPath: Array<number>, name: string}>;
function renameChapter(accessPath: Array<number>, name: string): RENAME_CHAPTER {
  return {
    type: "RENAME_CHAPTER",
    payload: {
      accessPath,
      name
    }
  };
}

export type REMOVE_CHAPTER = PayloadAction<"REMOVE_CHAPTER", {accessPath: Array<number>}>;
function removeChapter(accessPath: Array<number>): REMOVE_CHAPTER {
  return {
    type: "REMOVE_CHAPTER",
    payload: {
      accessPath
    }
  };
}

export interface ChapterActions extends ActionCreatorsMapObject {
  loadChapterTree: (tree: ChapterState) => LOAD_CHAPTER_TREE;
  addChapterAfter: (accessPath: Array<number>) => ADD_CHAPTER_AFTER;
  addChapterBefore: (accessPath: Array<number>) => ADD_CHAPTER_BEFORE;
  addChapterChild: (accessPath: Array<number>) => ADD_CHAPTER_CHILD;
  renameChapter: (accessPath: Array<number>, name: string) => RENAME_CHAPTER;
  removeChapter: (accessPath: Array<number>) => REMOVE_CHAPTER;
}

export const actionCreators: ChapterActions = {
  loadChapterTree,
  addChapterAfter,
  addChapterBefore,
  addChapterChild,
  renameChapter,
  removeChapter
};
