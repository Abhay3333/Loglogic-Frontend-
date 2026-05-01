import React from 'react';
import { Link } from 'react-router-dom';
import { FaTerminal } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#0f141a] border-t border-[#44484f]/15 w-full py-12 px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto font-['Inter'] text-sm">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link className="flex items-center gap-2 group" to="/">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,238,252,0.2)]">
              <FaTerminal className="text-on-primary-container text-xl" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tighter text-primary-fixed">LogLogic</span>
          </Link>
          <p className="text-[#a8abb3] text-center md:text-left">© 2024 LogLogic Inc. Precision Engineering for Logs.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link className="text-[#a8abb3] hover:text-white transition-colors" to="/privacy">Privacy</Link>
          <Link className="text-[#a8abb3] hover:text-white transition-colors" to="/terms">Terms</Link>
          <a className="text-[#a8abb3] hover:text-white transition-colors" href="#">Security</a>
          <a className="text-[#a8abb3] hover:text-white transition-colors" href="#">Status</a>
          <a className="text-[#a8abb3] hover:text-white transition-colors" href="#">Twitter</a>
          <a className="text-[#a8abb3] hover:text-white transition-colors" href="#">GitHub</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
