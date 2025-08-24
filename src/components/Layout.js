import Navbar from './Navbar';
import Footer from './Footer';
import React from 'react';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh' }}>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
