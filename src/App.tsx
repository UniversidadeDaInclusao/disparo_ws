import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { FilesPage } from "@/pages/FilesPage";
import { WorkspacePage } from "@/pages/WorkspacePage";

export function App() {
  // HashRouter: funciona em hospedagem estática (GitHub Pages) sem
  // precisar de rewrites no servidor.
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<FilesPage />} />
        <Route path="/files/:fileId" element={<WorkspacePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
