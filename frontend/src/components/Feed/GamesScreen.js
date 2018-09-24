import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import BottomNavBar from "../BottomNavBar";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import IconButton from "@material-ui/core/IconButton/IconButton";
import AppBar from "@material-ui/core/AppBar/AppBar";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Tabs from "@material-ui/core/Tabs/Tabs";
import Tab from "@material-ui/core/Tab/Tab";
import GamesList from "./GamesList";
import InfoBar from "./InfoBar";
import ReactGA from 'react-ga';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  card: {
    minWidth: 275,
    margin: 10,
    borderRadius: 10
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  grow: {
    flexGrow: 1,
  },
  header: {
    textShadow: `-1px 0 #BCF4F5, 0 1px  #BCF4F5, 1px 0  #BCF4F5, 0 -1px  #BCF4F5`,
  },
  tab: {
    width: '50%'
  }
});

class GamesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0
    }
  }
  componentDidMount() {
    ReactGA.pageview('Games Feed');
  };
  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.header} variant="display2" noWrap>
              G
            </Typography>
            <Typography className={classes.header} variant="display1" noWrap>
              ames
            </Typography>
            <div className={classes.grow} />
            <div className={classes.sectionMobile}>
              <IconButton aria-haspopup="true" onClick={this.handleSearch} color="inherit">
                <FontAwesomeIcon icon="search" size="sm"/>
              </IconButton>
              <IconButton aria-haspopup="true" onClick={this.handleFilter} color="inherit">
                <FontAwesomeIcon icon="filter" size="sm"/>
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        <InfoBar left="999 ongoing games!" right="100"/>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange}
                textColor="primary" fullWidth elevation={0}
          >
            <Tab label="All Games" className={classes.tab}/>
            <Tab label="Your Games" className={classes.tab}/>
          </Tabs>
        </AppBar>

        {value === 0 && <GamesList/>}
        {value === 1 && <GamesList/>}
        <BottomNavBar value={0}/>
      </div>
    );
  }
}

export default withStyles(styles)(GamesScreen);