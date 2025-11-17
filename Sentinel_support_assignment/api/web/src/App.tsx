import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Alerts from './pages/Alerts';

import Customer from './pages/Customer';

import Evals from './pages/Evals';
import Dashboard from './pages/Dashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/customer/:id" element={<Customer />} />
        <Route path="/evals" element={<Evals />} />
      </Routes>
    </Router>
  );
}

export default App;
