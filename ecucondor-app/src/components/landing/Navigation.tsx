'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navigationLinks = [
  { href: '#features', label: 'Características' },
  { href: '#testimonials', label: 'Testimonios' },
  { href: '#about', label: 'Acerca de' },
  { href: '#contact', label: 'Contacto' }
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    
    // Smooth scroll para enlaces internos
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <nav className="bg-black/90 backdrop-blur-sm border-b border-yellow-500/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-yellow-400 cursor-pointer">
                ECUCONDOR
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-gray-300 hover:text-yellow-400 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/50"
            >
              Comenzar
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-yellow-400 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-yellow-500/30"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95">
                {navigationLinks.map((link, index) => (
                  <motion.button
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleLinkClick(link.href)}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-md transition-colors"
                  >
                    {link.label}
                  </motion.button>
                ))}
                
                <div className="pt-4 pb-2 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-3 py-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-md transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold px-3 py-2 rounded-md transition-all duration-300"
                  >
                    Comenzar
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}