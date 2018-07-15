import axios from 'axios';

import { GET_USER_STATUS } from '../constants';
/* Enable if server / sockets are on
import { GET_USER_STATUS, USER_CONNECTED } from '../constants';
import { initSocket, socket } from './socket'; //disable sockets
*/
export const getUser = (noServer = false) => (dispatch) => {
  if (noServer) return;
  // initSocket(dispatch);
  // socket.emit(USER_CONNECTED, 'new user connected');

  axios
    .get('/api/profile')
    .then(({ data }) => {
      dispatch({
        type: GET_USER_STATUS,
        payload: data,
      });
    })
    .catch((err) => {
      console.log(`getUser failed: ${err}`);
    });
};

export const authSuccess = () => {
  console.log('login success');
};

