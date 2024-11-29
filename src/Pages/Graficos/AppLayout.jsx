import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Grafico from 'Grafico';

const AppLayout = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  return (
    <div>
      {/* Passa o estado e a função para alternar o tema para a Navbar */}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      {/* Passa o estado para o componente Grafico */}
      <Grafico darkMode={darkMode} />
    </div>
  );
};

export default AppLayout;
