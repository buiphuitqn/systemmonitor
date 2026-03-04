// src/appRedux/reducers/index.js
import { combineReducers } from 'redux';
import Auth from './Auth';

const rootReducer = combineReducers({
  auth: Auth,   // state.auth
});

export default rootReducer;
