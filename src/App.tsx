import { Routes, Route } from 'react-router-dom';
import Display from "./Display/Display.tsx";
import { CssBaseline } from "@mui/material";

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/display" element={<Display />} />
      </Routes>
    </>
  )
}

export default App
