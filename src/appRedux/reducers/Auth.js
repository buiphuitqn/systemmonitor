import {
  HIDE_MESSAGE,
  INIT_URL,
  ON_HIDE_LOADER,
  ON_SHOW_LOADER,
  SHOW_MESSAGE,
  SIGNIN_USER_SUCCESS
} from "constants/ActionTypes";

const INIT_STATE = {
  loader: false,
  alertMessage: '',
  showMessage: false,
  initURL: '',
  authUser: null,
};

const auth = (state = INIT_STATE, action) => {
  switch (action.type) {

    case SIGNIN_USER_SUCCESS:
      return {
        ...state,
        loader: false,
        authUser: action.payload,
        showMessage: false,
      };

    case SHOW_MESSAGE:
      return {
        ...state,
        alertMessage: action.payload,
        showMessage: true,
        loader: false,
      };

    case HIDE_MESSAGE:
      return {
        ...state,
        alertMessage: '',
        showMessage: false,
      };

    case INIT_URL:
      return {
        ...state,
        initURL: action.payload,
      };

    case ON_SHOW_LOADER:
      return { ...state, loader: true };

    case ON_HIDE_LOADER:
      return { ...state, loader: false };

    default:
      return state;
  }
};

export default auth;
