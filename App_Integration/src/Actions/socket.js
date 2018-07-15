import io from 'socket.io-client';

import {
  serverUrl,
  SOCKET_EVENTS,
} from '../constants';

export const socket = io(serverUrl());

export const initSocket = (dispatch) => {
  console.log('hello')
  socket.on('connect', () => {
    console.log('welcome to Tetris!');
  });

  SOCKET_EVENTS.forEach(type =>
    socket.on(type, (payload) => {
      dispatch({ type, payload });
    }));
};
