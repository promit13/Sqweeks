import { CHECK_USER, ACTION_LOGOUT } from "../actions/types";

//  returns the user value based on the action type provided.
export const checkUser = (initialState = {}, action) => {
  switch (action.type) {
    case CHECK_USER: {
      return { user: action.payload };
    }
    case ACTION_LOGOUT: {
      return { user: {} };
    }
    default:
      return initialState;
  }
};
