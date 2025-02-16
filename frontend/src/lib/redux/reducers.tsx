import { api } from "@/lib/api";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const reducers = combineReducers({
  api: api.reducer,
});

const persistConfig = {
  key: "root",
  whitelist: [],
  storage,
};

const persistedReducers = persistReducer(persistConfig, reducers);
export default persistedReducers;
