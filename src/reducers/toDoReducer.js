import { initialState } from "./initialState";
import {
  SET_TO_DO_LIST,
  NEW_TO_DO,
  TO_DO_CHECKED,
  TO_DO_UNCHECKED,
} from "../actions/index";

const todoReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TO_DO_LIST:
      return {
        ...state,
        todos: [
          ...state.todos,
          ...action.payload.todos.map((todo) => {
            return {
              ...todo,
              isCheked: false,
            };
          }),
        ],
        completeTodos: [
          ...state.completeTodos,
          ...action.payload.completeTodos.map((cTodo) => {
            return {
              ...cTodo,
              isChecked: true,
            };
          }),
        ],
      };
    case NEW_TO_DO:
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };
    case TO_DO_CHECKED: {
      let idx = state.todos.findIndex((todo) => todo.id === action.payload.id);
      let front = state.todos.slice(0, idx);
      let back = state.todos.slice(idx + 1);
      return {
        ...state,
        todos: [...front, action.payload, ...back],
      };
    }
    case TO_DO_UNCHECKED: {
      let idx = state.todos.findIndex((todo) => todo.id === action.payload.id);
      let front = state.todos.slice(0, idx);
      let back = state.todos.slice(idx + 1);
      return {
        ...state,
        todos: [...front, action.payload, ...back],
      };
    }
    default:
      return state;
  }
};

export default todoReducer;
