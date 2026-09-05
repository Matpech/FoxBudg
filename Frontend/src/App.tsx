import { BrowserRouter, Route, Routes } from "react-router-dom"
import RootRedirect from "./components/routing/RootRedirect"
import LangLayout from "./components/layout/LangLayout"
import { LoginPage } from "./pages/LoginPage"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"

function App() {
  return (
    <div className="dark:bg-zinc-950 transition-colors duration-200">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/:lang" element={<LangLayout />} >
              <Route index element={<RootRedirect />} />
              <Route path="login" element={<LoginPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>

      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
