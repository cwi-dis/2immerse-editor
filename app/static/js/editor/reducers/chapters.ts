/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { List, Record } from "immutable";
import * as shortid from "shortid";
import { generateChapterKeyPath, Nullable } from "../util";
import { ActionHandler } from "../action_handler";
import * as actions from "../actions/chapters";
import { ChapterTree } from "../components/start_page";

export interface ChapterAttributes {
  id: string;
  name?: Nullable<string>;
  children?: List<Chapter>;
}

export class Chapter extends Record<ChapterAttributes>({id: "", name: null, children: List()}) {
  constructor(params?: ChapterAttributes) {
    params ? super(params) : super();
  }
}

export type ChapterState = List<Chapter>;

export const initialState: List<Chapter> = List([
  new Chapter({id: shortid.generate()})
]);

const actionHandler = new ActionHandler<ChapterState>(initialState);

actionHandler.addHandler("LOAD_CHAPTER_TREE", (state, action: actions.LOAD_CHAPTER_TREE) => {
  const { tree } = action.payload;

  // Extract data from node and call function recursively on child nodes
  const parseChapter = (tree: ChapterTree): Chapter => {
    return new Chapter({
      id: tree.id,
      name: tree.name,
      children: List(tree.chapters.map((child) => {
        return parseChapter(child);
      }))
    });
  };

  // Parse tree and store it in a list
  return List([
    parseChapter(tree)
  ]);
});

actionHandler.addHandler("ADD_CHAPTER_BEFORE", (state, action: actions.ADD_CHAPTER_BEFORE) => {
  const { accessPath, id } = action.payload;

  // Insert index is the last entry in the access path
  const insertIndex = accessPath[accessPath.length - 1];
  let list: List<Chapter> = state;

  // Navigate to right tree level
  accessPath.slice(0, accessPath.length - 1).forEach((i) => {
    list = list.get(i)!.get("children")!;
  });

  // Insert new chapter at the given index
  const updatedChildren = list.insert(insertIndex, new Chapter({id: id || shortid.generate()}));
  const keyPath = generateChapterKeyPath(accessPath).pop();

  // Update state
  return state.updateIn(keyPath, () => updatedChildren);
});

actionHandler.addHandler("ADD_CHAPTER_AFTER", (state, action: actions.ADD_CHAPTER_AFTER) => {
  const { accessPath, id } = action.payload;

  // Insert index is the last entry in the access path
  const insertIndex = accessPath[accessPath.length - 1];
  let list: List<Chapter> = state;

  // Navigate to the right tree level
  accessPath.slice(0, accessPath.length - 1).forEach((i) => {
    list = list.get(i)!.get("children")!;
  });

  // Insert new chapter at index or simply push it into the list if it's the last position
  const newChapter = new Chapter({id: id || shortid.generate()});
  const updatedChildren = (insertIndex >= list.count()) ? list.push(newChapter) : list.insert(insertIndex + 1, newChapter);
  const keyPath = generateChapterKeyPath(accessPath).pop();

  return state.updateIn(keyPath, () => updatedChildren);
});

actionHandler.addHandler("ADD_CHAPTER_CHILD", (state, action: actions.ADD_CHAPTER_CHILD) => {
  const { accessPath, id } = action.payload;
  // Append the 'children' property to the access path
  const keyPath = generateChapterKeyPath(accessPath).push("children");

  // Create new chapter and append children of current chapter to it
  const newChapter = new Chapter({
    id: id || shortid.generate(),
    children: state.getIn(keyPath)
  });

  // Set new chapter as child of current chapter
  return state.updateIn(keyPath, () => List([newChapter]));
});

actionHandler.addHandler("RENAME_CHAPTER", (state, action: actions.RENAME_CHAPTER) => {
  const { accessPath, name } = action.payload;
  // Append 'name' property to access path
  const keyPath = generateChapterKeyPath(accessPath).push("name");

  // Override name for current chapter
  return state.updateIn(keyPath, () => name);
});

actionHandler.addHandler("REMOVE_CHAPTER", (state, action: actions.REMOVE_CHAPTER) => {
  const { accessPath } = action.payload;
  const keyPath = generateChapterKeyPath(accessPath);

  // Get index of chapter to be removed
  const nodeIndex = keyPath.last() as number;
  // Get children of chapter to be removed
  const children = state.getIn(keyPath.push("children"));
  // Get parent chapter
  const parentPath = keyPath.butLast();

  return state.updateIn(parentPath, (chapters) => {
    // Get all chapters before the removed node
    const head = chapters.slice(0, nodeIndex);
    // Get all chapters after the removed node
    const tail = chapters.slice(nodeIndex + 1);

    // Insert children of removed chapter in place of removed chapter
    return head.concat(children).concat(tail);
  });
});

export default actionHandler.getReducer();
