import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import Typography from "@material-ui/core/Typography/Typography";
import AppBar from "@material-ui/core/AppBar/AppBar";
import BottomNavBar from "../shared/BottomNavBar";
import Tabs from "@material-ui/core/Tabs/Tabs";
import Tab from "@material-ui/core/Tab/Tab";
import Leaderboard from "./GlobalLeaderboard";
import Paper from "@material-ui/core/Paper/Paper";
import Avatar from "@material-ui/core/Avatar/Avatar";
import ReactGA from "react-ga";

import {Query} from 'react-apollo'
import gql from 'graphql-tag'
import FriendLeaderboard from "./FriendLeaderboard";

const GET_RANKING = gql`
  {
    user {
      name
      img
      winRate
      ranking
    }
  }
`;


const styles = theme => ({
  header: {
    textShadow: `-1px 0 #BCF4F5, 0 1px  #BCF4F5, 1px 0  #BCF4F5, 0 -1px  #BCF4F5`,
  },
  body: {
    backgroundColor: '#068D9D',
  },
  tableTitle: {
    backgroundColor: '#068D9D',
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5
  },
  tab: {
    width: '50%'
  },
  subHeaders: {
    backgroundColor: '#014262',
    padding: 10,
    display: 'flex',
    justifyContent: 'space-between'
  },
  subHeader: {
    color: '#fff'
  },
  userRank: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff'
  },
  user: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  userName: {
    fontSize: '1rem',
    color: '#014262'
  },
  rank: {
    color: '#014262'
  },
  avatar: {
    marginLeft: 5,
    marginRight: 5,
    height: 40,
    width: 40
  },
  rankContainer: {
    margin: 5
  },
  lockedContainer: {
    padding: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  lockedText: {
    color: '#014262',
    fontSize: '1.2rem'
  }
});

let parseWinRate = (rawWinRate) => {
  let winRate = rawWinRate * 100.0;
  return winRate.toFixed(1) + "%"
};


class SocialScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      ranking: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    }
  }

  componentDidMount() {
    ReactGA.pageview('Leaderboard');
  };

  handleChange = (event, value) => {
    this.setState({value});
  };

  render() {
    const {classes} = this.props;
    const {value} = this.state;

    return (
      <div className={classes.body}>
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.header} variant="display2" noWrap>
              L
            </Typography>
            <Typography className={classes.header} variant="display1" noWrap>
              eaderboard
            </Typography>
            <div className={classes.grow}/>
          </Toolbar>
        </AppBar>

        <AppBar position="static" elevation={0}>
          <Tabs value={value} onChange={this.handleChange}
                textColor="primary" fullWidth elevation={0}
          >
            <Tab label="Global" className={classes.tab}/>
            <Tab label="Friends" className={classes.tab}/>
          </Tabs>
        </AppBar>
        <div className={classes.tableTitle}>
          <Paper elevation={0} className={classes.subHeaders}>
            <Typography variant="subheading" className={classes.subHeader}>
              Rank
            </Typography>
            <Typography variant="subheading" className={classes.subHeader}>
              Name
            </Typography>
            <Typography variant="subheading" className={classes.subHeader}>
              Win Rate
            </Typography>
          </Paper>
        </div>
        {value === 0 && <Leaderboard/>}
        {value === 1 && <FriendLeaderboard/>}
        <Query query={GET_RANKING} fetchPolicy="cache-and-network" errorPolicy="ignore">
          {({loading, error, data}) => {
            if (loading) {
              return (
                <div className={classes.lockedContainer}>
                  <Typography variant="title" className={classes.lockedText} align="center">
                    Play at least 10 games to appear on the leaderboard!
                  </Typography>
                </div>
              );
            }
            if (!data) {
              return (
                <div className={classes.lockedContainer}>
                  <Typography variant="title" className={classes.lockedText} align="center">
                    Play at least 10 games to appear on the leaderboard!
                  </Typography>
                </div>
              );
            }
            let profile = data ? data.user : null;
            return profile.ranking == null
              ? (
                <div className={classes.lockedContainer}>
                  <Typography variant="title" className={classes.lockedText} align="center">
                    Play at least 10 games to appear on the leaderboard!
                  </Typography>
                </div>
              )
              : (
                <div className={classes.userRank}>
                  <Paper elevation={0} className={classes.rankContainer}>
                    <Typography variant="display2" className={classes.rank}>
                      {profile.ranking}
                    </Typography>
                  </Paper>
                  <Paper elevation={0} className={classes.user}>
                    <Avatar
                      alt="Profile Pic"
                      src={profile.img}
                      className={classes.avatar}
                    />
                    <Typography variant="title" className={classes.userName}>
                      {profile.name}
                    </Typography>
                  </Paper>
                  <Paper elevation={0}>
                    <Typography variant="subheading" className={classes.rank}>
                      {parseWinRate(profile.winRate)}
                    </Typography>
                  </Paper>
                </div>
              );

          }}
        </Query>
        <BottomNavBar value={3}/>
      </div>
    );
  }
}

export default withStyles(styles)(SocialScreen);