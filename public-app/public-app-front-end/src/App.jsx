import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { restoreAuth } from './redux/slices/authSlice';
import './styles/index.css';

// Pages
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import OrderHistoryPage from './pages/OrderHistory';
import TrackOrderPage from './pages/TrackOrder';
import ProfilePage from './pages/Profile';
import OutstandingPage from './pages/Outstanding';
import OffersPage from './pages/Offers';
import OrderPlacementPage from './pages/OrderPlacement';
import CommunicationPage from './pages/Communication';
import CreditNotesPage from './pages/CreditNotes';
import CreateCreditNotePage from './pages/CreateCreditNote';
import NotFoundPage from './pages/NotFound';

function App() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    // Restore auth from localStorage on app load
    dispatch(restoreAuth());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/outstanding" element={<OutstandingPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/order-placement" element={<OrderPlacementPage />} />
        <Route path="/communication" element={<CommunicationPage />} />
        <Route path="/credit-notes" element={<CreditNotesPage />} />
        <Route path="/credit-notes/new" element={<CreateCreditNotePage />} />
        <Route path="/credit-notes/:id/edit" element={<CreateCreditNotePage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
