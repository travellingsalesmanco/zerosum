import React, {Component, Fragment} from 'react';
import FacebookLogin from 'react-facebook-login'
import {withStyles} from '@material-ui/core/styles';
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import Typography from "@material-ui/core/Typography/Typography";
import AppBar from "@material-ui/core/AppBar/AppBar";
import LoginLogo from './assets/login-logo.png';
import {loginWithFacebook} from "../utils/auth";

const styles = theme => ({
  body: {
    backgroundColor: '#068D9D',
    height: '100vh',
  },
  header: {
    textShadow: `-1px 0 #BCF4F5, 0 1px  #BCF4F5, 1px 0  #BCF4F5, 0 -1px  #BCF4F5`,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    [theme.breakpoints.down('sm')]: {
      width: '100vw',
    },
    [theme.breakpoints.up('sm')]: {
      marginTop: 10,
      width: 512,
    }
  }
});

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null
    }
  }

  componentWillMount() {
    this.setState({loading: false, error: null})
  }

  fbLoginResponse = res => {
    this.setState({loading: true});
    if (res.userID) {
      loginWithFacebook(res.accessToken, res.userID).catch(e => {
        console.log("Login error: " + e);
        this.setState({loading: false, error: e})
      })
    } else {
      console.log(res);
      this.setState({loading: false, error: res})
    }
  };

  render() {
    const {classes} = this.props;
    let loginButtonWithError = (
      <Fragment>
        <FacebookLogin
          appId="470572713427485"
          onClick={() => this.setState({loading: true})}
          callback={this.fbLoginResponse}
          icon="fa-facebook-square"
        />
        {this.state.error ? "Error logging in" : null}
      </Fragment>
    );
    return (
      <div className={classes.body}>
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.header} variant="display2" noWrap>
              L
            </Typography>
            <Typography className={classes.header} variant="display1" noWrap>
              ogin
            </Typography>
            <div className={classes.grow}/>
          </Toolbar>
        </AppBar>
        <div className={classes.container}>
          <img alt="ZeroSum" src={LoginLogo} className={classes.logo}/>
          {this.state.loading ? "LOADING" : loginButtonWithError}
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(LoginScreen);