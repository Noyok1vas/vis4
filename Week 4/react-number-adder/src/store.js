// store.js
import { createStore } from 'redux';

const initialState = {
  history: [],  // e.g. [1, -2, 'RESET', 2]
  count: 0,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_1': {
      console.log('ADD1', state, action.payload);
      return {
        ...state,
        count: state.count + 1,
        history: [...state.history, 1],
      };
    }

    case 'ADD_2': {
      console.log('ADD2', state, action.payload);
      return {
        ...state,
        count: state.count + 2,
        history: [...state.history, 2],
      };
    }

    case 'REMOVE_1': {
      console.log('REMOVE1', state, action.payload);
      return {
        ...state,
        count: state.count - 1,
        history: [...state.history, -1],
      };
    }

    case 'REMOVE_2': {
      console.log('REMOVE2', state, action.payload);
      return {
        ...state,
        count: state.count - 2,
        history: [...state.history, -2],
      };
    }

    case 'RESET': {
      console.log('RESET', state, action.payload);
      return {
        ...state,
        count: 0,
        history: [...state.history, 'RESET'],
      };
    }

    case 'CLEAR_ALL': {
      console.log('CLEAR_ALL', state, action.payload);
      return { ...state, count: 0, history: [] };
    }

 
    case 'UPDATE_HISTORY': {
      console.log('UPDATE_HISTORY', state, action.payload);
      const i = action.payload;
      const item = state.history[i];


      let nextCount = state.count;
      if (typeof item === 'number') {
        nextCount = state.count - item;
      }

      return {
        ...state,
        count: nextCount,
        history: [
          ...state.history.slice(0, i),
          ...state.history.slice(i + 1),
        ],
      };
    }

    default:
      return state;
  }
};

const store = createStore(reducer);
export default store;