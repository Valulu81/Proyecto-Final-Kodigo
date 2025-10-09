import { NavLink } from "react-router-dom";
import { Table2, KanbanSquare } from "lucide-react";

export default function Navbar() {
    return (
        <header className="h-14 w-full bg-[#472268] text-white">
            <div className="flex h-full items-center justify-end px-10">
                <nav className="flex items-center gap-8">
                    <NavLink
                        to="/tabla"
                        className={({ isActive }) =>
                            `flex items-center gap-2 text-base transition ${
                                isActive ? "font-semibold" : "text-white/80 hover:text-white"
                            }`
                        }
                    >
                        <Table2 size={18} strokeWidth={1.8} />
                        <span>Tabla</span>
                    </NavLink>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-2 text-base transition ${
                                isActive ? "font-semibold" : "text-white/80 hover:text-white"
                            }`
                        }
                    >
                        <KanbanSquare size={18} strokeWidth={1.8} />
                        <span>Kanban</span>
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}