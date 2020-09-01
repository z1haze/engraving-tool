import {createStore} from 'redux';

function reducer (state = {}, action) {
    switch (action.type) {
        case 'SET':
            state[action.key] = action.val;
            break;
        case 'SET_TEXT_AREA':
            state.hits[action.index].c_textArea = action.textArea; // eslint-disable-line camelcase
    }

    return state;
}

const store = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;