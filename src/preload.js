const promiseIpc = require('electron-promise-ipc');
const fs = require('fs');
const errors = require('./types-errors.js');

window.promiseIpc = promiseIpc;
window.errors = errors;