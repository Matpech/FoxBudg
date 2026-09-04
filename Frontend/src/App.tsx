import { BrowserRouter, Route, Routes } from "react-router-dom"
import RootRedirect from "./components/routing/RootRedirect"
import LangLayout from "./components/layout/LangLayout"
import { LoginPage } from "./pages/LoginPage"

function App() {
  return (
    <div className="dark:bg-zinc-950 transition-colors duration-200">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/:lang" element={<LangLayout />} >
            <Route path="login" element={<LoginPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
