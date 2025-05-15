import { combineReducers } from 'redux';
import user from './user';
import project from './project';
import  slides from './slide';
import  tiles from './tile';

export default combineReducers({
  user,
  project,
  slides,
  tiles
});
