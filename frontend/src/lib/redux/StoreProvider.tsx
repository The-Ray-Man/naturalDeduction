"use client";
import { PropsWithChildren, useRef } from "react";
import { Provider } from "react-redux";
import { AppStore, makeStore } from "@/lib/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Persistor } from "redux-persist";

const StoreProvider = ({ children }: PropsWithChildren) => {
  const ref = useRef<{ store: AppStore; persistor: Persistor } | null>(null);

  if (!ref.current) {
    ref.current = makeStore();
  }

  return (
    <Provider store={ref.current.store}>
      <PersistGate loading={null} persistor={ref.current.persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default StoreProvider;
