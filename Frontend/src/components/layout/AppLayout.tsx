import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppLayout() {
    return (
        <div className="max-w-7xl mx-auto">
            <Navbar />
            <Outlet />
        </div>
    )
}