import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Santa Maria Ativa. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
