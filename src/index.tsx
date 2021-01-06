// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from "App";
import './styles.css';

(window as any).global = window;
// @ts-ignore
window.Buffer = window.Buffer || require('buffer').Buffer;

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);