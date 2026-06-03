import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { FilesPage } from "@/pages/FilesPage";
import { WorkspacePage } from "@/pages/WorkspacePage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FilesPage />} />
        <Route path="/files/:fileId" element={<WorkspacePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
