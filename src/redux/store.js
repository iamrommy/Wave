// import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import authSlice from "./authSlice.js";
// import postSlice from './postSlice.js';
// import socketSlice from "./socketSlice.js"
// import chatSlice from "./chatSlice.js";
// import rtnSlice from "./rtnSlice.js";

// import { 
//     persistReducer,
//     FLUSH,
//     REHYDRATE,
//     PAUSE,
//     PERSIST,
//     PURGE,
//     REGISTER,
// } from 'redux-persist'
// import storage from 'redux-persist/lib/storage'


// const persistConfig = {
//     key: 'root',
//     version: 1,
//     storage,
// }

// const rootReducer = combineReducers({
//     auth:authSlice,
//     post:postSlice,
//     socketio:socketSlice,
//     chat:chatSlice,
//     realTimeNotification:rtnSlice
// })

// const persistedReducer = persistReducer(persistConfig, rootReducer)

// // const store = configureStore({
// //     reducer: persistedReducer,
// //     middleware: (getDefaultMiddleware) =>
// //         getDefaultMiddleware({
// //             serializableCheck: {
// //                 ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
// //             },
// //         }),
// // });

// const store = configureStore({
//     reducer: persistedReducer,
//     middleware: (getDefaultMiddleware) =>
//         getDefaultMiddleware({
//             serializableCheck: {
//                 ignoredActions: [
//                     FLUSH,
//                     REHYDRATE,
//                     PAUSE,
//                     PERSIST,
//                     PURGE,
//                     REGISTER,
//                     'socketio/setSocket'  // Ignore this action type
//                 ],
//                 ignoredPaths: [
//                     'socketio.socket'  // Ignore this path in the state
//                 ],
//             },
//         }),
// });

// export default store;

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice.js";
import postSlice from './postSlice.js';
import socketSlice from "./socketSlice.js";
import chatSlice from "./chatSlice.js";
import rtnSlice from "./rtnSlice.js";

import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { persistStore } from 'redux-persist';

// 🔄 Transform to ignore socket object in socket slice
import { createTransform } from 'redux-persist';

const ignoreSocketTransform = createTransform(
    (inboundState, key) => {
        if (key === 'socketio') {
            const { socket, ...rest } = inboundState;
            return rest;  // Exclude socket from persistence
        }
        return inboundState;
    },
    (outboundState) => outboundState,
    { whitelist: ['socketio'] }  // Apply only to 'socketio' slice
);

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    transforms: [ignoreSocketTransform]  // 🔄 Apply the transform here
};

const rootReducer = combineReducers({
    auth: authSlice,
    post: postSlice,
    socketio: socketSlice,
    chat: chatSlice,
    realTimeNotification: rtnSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                    'socketio/setSocket'  // Ignore this action type
                ],
                ignoredPaths: [
                    'socketio.socket'  // Ignore this path in the state
                ],
            },
        }),
});

const persistor = persistStore(store);

export { store, persistor };

