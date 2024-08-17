import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import InputPage from './components/InputPage';
import Input1 from './components/Input1';
import Input2 from './components/Input2';
import Input3 from './components/Input3';
import Input4 from './components/Input4';
import GeneratePage from './components/GeneratePage';
import ViewPage from './components/ViewPage';
import ExportPage from './components/ExportPage';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"



function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14  justify-between">
        <h1 className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">THRIVE-Card</span>
          </Link>
        </h1>
        <nav className="flex items-center space-x-6 text-sm font-medium ">
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
    <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
      {showNavBar && <NavBar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/input1" element={<Input1 />} />
          <Route path="/input2" element={<Input2 />} />
          <Route path="/input3" element={<Input3 />} />
          <Route path="/input4" element={<Input4 />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/view" element={<ViewPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Georgia Tech Research Institute (GTRI), All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { FormProvider } from '../FormContext';

function App() {
  return (
    <Router>
      <FormProvider>
        <AppContent />
      </FormProvider>
    </Router>
  );
}

export default App;
