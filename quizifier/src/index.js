import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app.js';

let api = 'https://quizifier-server.herokuapp.com/';

ReactDOM.render(
    <App api={api}/> ,
  document.getElementById('root')
);