import React from 'react';
import './Login.css';
import PropTypes from 'prop-types';

// connect to redux
import { connect } from 'react-redux';

const mapStateToProps = state => state;

// end redux
class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = { };
  }
  render() {
    if (this.props.user.authenticated) {
      return (
        <div className="login">
          <h1>Hello {this.props.user.displayName}</h1>
          <h4>{this.props.user.email}</h4>
          <a href="/auth/logout">Logout</a>
          <br />
          <a href="/">Back to App Page</a>
        </div>
      );
    }
    return (
      <div className="login">
        <a href="/auth/google">Login With Google</a>
        <br />
        <a href="/">Back to App Page</a>
      </div>
    );
  }

}

Login.defaultProps = {
  user: null,
};

Login.propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
};

export default connect(mapStateToProps)(Login);

