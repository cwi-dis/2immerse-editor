import { ActionCreatorsMapObject } from "redux";
import { PayloadAction } from "../util";

export type ASSIGN_DOCUMENT_ID = PayloadAction<"ASSIGN_DOCUMENT_ID", {documentId: string, baseUrl: string}>;
function assignDocumentId(documentId: string, baseUrl: string): ASSIGN_DOCUMENT_ID {
  return {
    type: "ASSIGN_DOCUMENT_ID",
    payload: {
      documentId, baseUrl
    }
  };
}

export interface DocumentActions extends ActionCreatorsMapObject {
  assignDocumentId: (documentId: string, baseUrl: string) => ASSIGN_DOCUMENT_ID;
}

export const actionCreators: DocumentActions = {
  assignDocumentId
};
