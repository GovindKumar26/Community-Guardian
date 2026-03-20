import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useState } from 'react';
import {
  Shield, LayoutDashboard, Bell, FileText, Users,
  PenSquare, LogOut, LogIn, Menu, X
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Shield size={22} className="brand-icon" />
          Community Guardian
        </Link>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link to="/alerts" className={isActive('/alerts')} onClick={() => setMenuOpen(false)}>
            <Bell size={16} /> Alerts
          </Link>
          {user && (
            <>
              <Link to="/digest" className={isActive('/digest')} onClick={() => setMenuOpen(false)}>
                <FileText size={16} /> My Digest
              </Link>
              <Link to="/circles" className={isActive('/circles')} onClick={() => setMenuOpen(false)}>
                <Users size={16} /> Safe Circles
              </Link>
              <Link to="/alerts/new" className={isActive('/alerts/new')} onClick={() => setMenuOpen(false)}>
                <span className="btn btn-primary btn-sm">
                  <PenSquare size={14} /> Report
                </span>
              </Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="nav-logout">
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
          {!user && (
            <Link to="/login" className={isActive('/login')} onClick={() => setMenuOpen(false)}>
              <span className="btn btn-primary btn-sm">
                <LogIn size={14} /> Sign In
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
