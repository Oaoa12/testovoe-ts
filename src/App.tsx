import React from 'react';
import RectangleConnector from './components/rectangleConnector/RectangleConnector';
import './styles.scss';

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Соединение прямоугольников</h1>
      <RectangleConnector />
    </div>
  );
};

export default App;