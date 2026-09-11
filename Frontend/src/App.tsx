import { BrowserRouter, Route, Routes } from "react-router-dom"
import RootRedirect from "./components/routing/RootRedirect"
import LangLayout from "./components/layout/LangLayout"
import { LoginPage } from "./pages/LoginPage"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"

import UR from "./components/routing/UnauthenticatedRoute"
import AR from "./components/routing/AuthenticatedRoute"
import AppLayout from "./components/layout/AppLayout"
import { DashboardPage } from "./pages/DashboardPage"
import { ReportsManagerPage } from "./pages/ReportsManagerPage"
import { ProfilePage } from "./pages/ProfilePage"

function App() {
  return (
    <div className="dark:bg-zinc-950 h-screen">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/:lang" element={<LangLayout />} >
              <Route index element={<RootRedirect />} />

              {/* Login page : unauthenticated access */}
              <Route path="login" element={<UR><LoginPage /></UR>} />

              {/* Main application routes : authenticated access */}
              <Route element={<AppLayout />} >
                <Route path="dashboard" element={<AR><DashboardPage /></AR>} />
                <Route path="reports" element={<AR><ReportsManagerPage /></AR>} />
                <Route path="profile/:user_id" element={<AR><ProfilePage /></AR>} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>

      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
