import { List } from "immutable";
import { ActionHandler, findById} from "../util";

type MasterId = string;

export interface Chapter {
  id: string;
  name?: string;
  masterLayouts: List<MasterId>;
  children: List<Chapter>;
}

export type ChapterState = List<Chapter>;

const actionHandler = new ActionHandler<ChapterState>(List<Chapter>());

export default actionHandler.getReducer();