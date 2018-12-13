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

  const parseChapter = (tree: ChapterTree): Chapter => {
    return new Chapter({
      id: tree.id,
      name: tree.name,
      children: List(tree.chapters.map((child) => {
        return parseChapter(child);
      }))
    });
  };

  return List([
    parseChapter(tree)
  ]);
});

actionHandler.addHandler("ADD_CHAPTER_BEFORE", (state, action: actions.ADD_CHAPTER_BEFORE) => {
  const { accessPath, id } = action.payload;

  const insertIndex = accessPath[accessPath.length - 1];
  let list: List<Chapter> = state;

  accessPath.slice(0, accessPath.length - 1).forEach((i) => {
    list = list.get(i)!.get("children")!;
  });

  const updatedChildren = list.insert(insertIndex, new Chapter({id: id || shortid.generate()}));
  const keyPath = generateChapterKeyPath(accessPath).pop();

  return state.updateIn(keyPath, () => updatedChildren);
});

actionHandler.addHandler("ADD_CHAPTER_AFTER", (state, action: actions.ADD_CHAPTER_AFTER) => {
  const { accessPath, id } = action.payload;

  const insertIndex = accessPath[accessPath.length - 1];
  let list: List<Chapter> = state;

  accessPath.slice(0, accessPath.length - 1).forEach((i) => {
    list = list.get(i)!.get("children")!;
  });

  const newChapter = new Chapter({id: id || shortid.generate()});
  const updatedChildren = (insertIndex >= list.count()) ? list.push(newChapter) : list.insert(insertIndex + 1, newChapter);
  const keyPath = generateChapterKeyPath(accessPath).pop();

  return state.updateIn(keyPath, () => updatedChildren);
});

actionHandler.addHandler("ADD_CHAPTER_CHILD", (state, action: actions.ADD_CHAPTER_CHILD) => {
  const { accessPath, id } = action.payload;
  const keyPath = generateChapterKeyPath(accessPath).push("children");

  const newChapter = new Chapter({
    id: id || shortid.generate(),
    children: state.getIn(keyPath)
  });

  return state.updateIn(keyPath, () => List([newChapter]));
});

actionHandler.addHandler("RENAME_CHAPTER", (state, action: actions.RENAME_CHAPTER) => {
  const { accessPath, name } = action.payload;
  const keyPath = generateChapterKeyPath(accessPath).push("name");

  return state.updateIn(keyPath, () => name);
});

actionHandler.addHandler("REMOVE_CHAPTER", (state, action: actions.REMOVE_CHAPTER) => {
  const { accessPath } = action.payload;
  const keyPath = generateChapterKeyPath(accessPath);

  const nodeIndex = keyPath.last() as number;
  const children = state.getIn(keyPath.push("children"));
  const parentPath = keyPath.butLast();

  return state.updateIn(parentPath, (chapters) => {
    const head = chapters.slice(0, nodeIndex);
    const tail = chapters.slice(nodeIndex + 1);

    return head.concat(children).concat(tail);
  });
});

export default actionHandler.getReducer();
