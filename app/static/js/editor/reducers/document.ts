import { ActionHandler } from "../action_handler";
import * as actions from "../actions/document";

export interface DocumentState {
  documentId: string;
}

export const initialState: DocumentState = {
  documentId: ""
};

const actionHandler = new ActionHandler<DocumentState>(initialState);

actionHandler.addHandler("ASSIGN_DOCUMENT_ID", (state, action: actions.ASSIGN_DOCUMENT_ID) => {
  const { documentId } = action.payload;

  return {
    ...state,
    documentId
  };
});

export default actionHandler.getReducer();
