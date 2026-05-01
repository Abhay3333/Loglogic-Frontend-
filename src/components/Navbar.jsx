import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTerminal } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "text-[#00F0FF] font-semibold hover:text-[#00F0FF] transition-colors duration-200"
      : "text-[#a8abb3] hover:text-[#00F0FF] transition-colors duration-200";
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0e14]/60 backdrop-blur-xl border-b border-[#44484f]/15">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <Link className="flex items-center gap-2 group" to="/">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,238,252,0.2)]">
            <FaTerminal className="text-on-primary-container text-xl" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tighter text-primary-fixed">LogLogic</span>
        </Link>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-['Space_Grotesk'] tracking-tight">
          <Link className={getLinkClass('/')} to="/">Home</Link>
          <Link className={getLinkClass('/pricing')} to="/pricing">Pricing</Link>
          <Link className={getLinkClass('/docs')} to="/docs">Docs</Link>
          <Link className={getLinkClass('/changelog')} to="/changelog">Changelog</Link>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login">
            <button className="text-[#a8abb3] hover:text-white transition-colors text-sm font-medium">Login</button>
          </Link>
          <Link to="/signup">
          <button className="bg-linear-to-r from-[#8ff5ff] to-[#00eefc] text-[#005359] px-5 py-2 rounded-lg font-bold cursor-pointer text-sm tracking-tight active:scale-95 duration-100 cta-glow">Start for Free</button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
