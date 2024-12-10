import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import authReducer from "./state/index.js";
import notificationReducer from './state/notificationSlice.js';
import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {Provider} from "react-redux";

import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import {PersistGate} from "redux-persist/integration/react";
import ChatProvider from "./Context/ChatProvider";

const persistConfig = {
    key: "root",
    storage,
    version: 1,
    blacklist: ["notification"],
};

const rootReducer = combineReducers({
    auth: authReducer,
    notification: notificationReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistStore(store)}>
                <ChatProvider>
                    <App/>
                </ChatProvider>
            </PersistGate>
        </Provider>
    </React.StrictMode>
);
