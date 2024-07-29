import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import InputPage from './components/InputPage';
import GeneratePage from './components/GeneratePage';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <h1 className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">THRIVE-Card</span>
          </Link>
        </h1>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link to="/input">Input</Link>
          <Link to="/generate">Generate</Link>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost">About</Button>
            </PopoverTrigger>
            <PopoverContent>
              This is a project created by GTRI for military spouses
            </PopoverContent>
          </Popover>
        </nav>
      </div>
    </header>
  );
}

function AppContent() {
  const location = useLocation();
  const showNavBar = location.pathname === '/';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {showNavBar && <NavBar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/generate" element={<GeneratePage />} />
        </Routes>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by GTRI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;