import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Symfoni } from "./hardhat/SymfoniContext";
import { Greeter } from './components/Greeter';
import { Arigatou } from './components/Arigatou';

function App() {

  return (
    <div>
      <Symfoni autoInit={true} >
        <Arigatou></Arigatou>
        <Greeter></Greeter>
      </Symfoni>
    </div>
  );
}

export default App;
