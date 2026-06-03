import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { App } from "@/App";
import { ConfigWarning } from "@/components/ConfigWarning";
import { isConfigured } from "@/lib/config";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {isConfigured() ? <App /> : <ConfigWarning />}
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  </React.StrictMode>
);
