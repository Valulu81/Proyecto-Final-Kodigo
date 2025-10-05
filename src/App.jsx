import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import Kanban from "./pages/Kanban.jsx";
import Tabla from "./pages/Tabla.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <div className="flex h-screen">
                <Routes>
                    <Route path="/" element={<Kanban />} />
                    <Route path="/tabla" element={<Tabla />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
