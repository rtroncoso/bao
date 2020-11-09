import React from 'react';
import { GameContainer } from '@mob/client/components/Game';

const App = () => {
  return (
    <div className="App bg-">
      <header className="App-header bg-gray-700">
        <GameContainer />
      </header>
    </div>
  );
}

export default App;
