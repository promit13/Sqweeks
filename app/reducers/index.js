import { combineReducers } from "redux";
import { checkUser } from "./authReducer";

export default combineReducers({
  checkUser,
});
