import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-primary/30 selection:text-white flex flex-col w-full overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

