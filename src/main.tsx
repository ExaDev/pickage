import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { BrowserRouter } from "react-router-dom";
import "@mantine/core/styles.css";
import "./index.css";
import App from "./App";
import { queryClient, localStoragePersister } from "./utils/cache";

async function enableMocking() {
  // Enable MSW mocking when ?msw=true query param is present
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("msw") !== "true") {
    return;
  }

  const { worker } = await import("./mocks/browser");
  return worker.start({
    onUnhandledRequest: "bypass", // Don't warn about unhandled requests
  });
}

void enableMocking().then(() => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: localStoragePersister }}
      >
        <BrowserRouter>
          <MantineProvider defaultColorScheme="auto">
            <App />
          </MantineProvider>
        </BrowserRouter>
      </PersistQueryClientProvider>
    </React.StrictMode>,
  );
});
