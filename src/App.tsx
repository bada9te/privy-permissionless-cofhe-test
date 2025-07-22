import { Route, Routes } from "react-router-dom";
import TEST from "./screens/TEST";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TEST />}/>
    </Routes>
  );
}

export default App;
