import { Action } from "../actions";

function screens(state = {}, action: Action) {
  switch (action.type) {
    case "ADD_PERSONAL_DEVICE":
      console.log("personal device reducer called");
      return state;
    case "ADD_COMMUNAL_DEVICE":
      console.log("communal device reducer called");
      return state;
    default:
      return state;
  }
}

export default screens;