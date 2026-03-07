import ContentComponent from "../Components/Content";
import { BrowserRouter, Routes, Route } from "react-router-dom";
export default function AppRouter() {

    return (
        <Route path="/home" element={<ContentComponent />} />
    )
}