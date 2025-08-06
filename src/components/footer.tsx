import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Atlas Cívico. Uma cidade melhor, juntos.</p>
      </div>
    </footer>
  );
};

export default Footer;
