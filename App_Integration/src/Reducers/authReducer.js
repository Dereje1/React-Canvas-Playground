import { GET_USER_STATUS } from '../constants';

const userStatusReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_USER_STATUS:
      return action.payload;
    default:
      return state;
  }
};

export default userStatusReducer;
