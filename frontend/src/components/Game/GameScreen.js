import React, {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Link} from 'react-router-dom';
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import Typography from "@material-ui/core/Typography/Typography";
import AppBar from "@material-ui/core/AppBar/AppBar";
import IconButton from '@material-ui/core/IconButton';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import CardContent from "@material-ui/core/CardContent/CardContent";
import Card from "@material-ui/core/Card/Card";
import Avatar from '@material-ui/core/Avatar';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Currency from "../shared/Currency";
import Dice from "../assets/dice-logo-blue.png";
import Paper from '@material-ui/core/Paper';
import Money from '../assets/money-bag.png';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import HattleCoin from "../assets/hattlecoin.png";
import CircularProgress from '@material-ui/core/CircularProgress';

import {Mutation, Query} from 'react-apollo';
import gql from "graphql-tag";
import CancelButton from "../shared/CancelButton";
import SubmitButton from "../shared/SubmitButton";
import AngryHatperor from "../assets/angry-hatperor.png";

const CREATE_VOTE = gql`
  mutation CreateVote($voteInput: VoteInput!) {
    addVote(vote: $voteInput) {
      money
    }
  }
`;

const GET_VOTE = gql`
  query GetVote($gameId: ID!, $withResult: Boolean!) {
    vote(gameId: $gameId) {
      option {
        id
        body
        result @include(if: $withResult) {
          voteCount
          totalValue
          winner
        }
      }
      money
      result @include(if: $withResult) {
        win
        netChange
      }
    }
  }
`;

const GET_PROFILE = gql`
  {
    user {
      money

    }
  }
`;

const styles = theme => ({
  fullHeight: {
    height: '100vh',
    backgroundColor: '#068D9D'
  },
  header: {
    textShadow: `-1px 0 #BCF4F5, 0 1px  #BCF4F5, 1px 0  #BCF4F5, 0 -1px  #BCF4F5`,
  },
  backButton: {
    justifyContent: 'flex-start'
  },
  grow: {
    flexGrow: 1,
  },
  questionCard: {
    borderRadius: 0,
  },
  cardTitle: {
    color: '#014262'
  },
  cardContentRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0
  },
  poster: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
    alignItems: 'center'
  },
  avatar: {
    margin: 10,
    height: 50,
    width: 50
  },
  optionSection: {
    backgroundColor: '#068D9D',
    borderRadius: 0,
  },
  optionCard: {
    minWidth: 275,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
    display: 'flex',
  },
  disabledOptionCard: {
    minWidth: 275,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
    display: 'flex',
    backgroundColor: '#c1d3d5'
  },
  chosenOptionText: {
    fontSize: '1.1rem',
    color: '#068D9D'
  },
  disabledOptionText: {
    color: '#949494'
  },
  button: {
    flex: 1,
    display: 'block'
  },
  icon: {
    color: '#068D9D'
  },
  dice: {
    height: 16,
    width: 16
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 0,
    marginBottom: 10
  },
  textInfo: {
    marginLeft: 5
  },
  pot: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  potText: {
    color: '#068D9D',
    textDecoration: 'underline'
  },
  moneyBag: {
    width: 24,
    height: 24
  },
  coin: {
    height: 24,
    width: 24
  },
  dialogText: {
    color: '#068D9D',
  },
  moneyInput: {
    backgroundColor: '#d7f1f5',
    borderRadius: 5,
  },
  progress: {
    margin: theme.spacing.unit * 3
  },
  success: {
    color: '#069d54'
  },
  failure: {
    color: '#9d0606'
  },
  queryDialog: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  voteOption: {
    flex: 1,
    padding: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  voteBet: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent'
  },
  voteBetText: {
    fontSize: '1rem',
    color: '#014262'
  },
  headerDivider: {
    borderLeft: '1px solid #068D9D',
    height: '100%',
    marginRight: theme.spacing.unit * 3
  },
  result: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  dialogTitle: {
    marginTop: 10,
  },
  errorMsg: {
    color: '#9d0606'
  },
  container: {
    backgroundColor: '#068D9D',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hatperor: {
    width: 250
  }
});

let parseOptionPercentage = (optionValue, totalValue) => {
  let winRate = optionValue / totalValue;
  if (totalValue === 0) {
    winRate = 0
  }
  winRate = winRate * 100;
  return winRate.toFixed(2) + "%"
};

let parseChange = (netChange) => {
  if (netChange < 0) {
    return "loss: " + -netChange
  } else {
    return "gained: " + netChange
  }
};

class GameScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      choice: '',
      playDialog: false,
      bet: '',
      loading: false,
      querySent: false,
      querySuccess: false,
      selected: 1,
      hasUserVoted: false,
      isGameOver: false,
      errorMsg: false
    }
  }

  handleChoice = (choice) => {
    this.setState({
      choice: choice,
      playDialog: true
    });
  };
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };
  handleClose = () => {
    this.setState({
      playDialog: false,
      bet: ''
    }, () => {
      if (this.state.querySent) {
        this.props.history.push('/games');
      }
    });
  };
  handleSubmit = (createVote, stakes) => {
    if (stakes === 'Fixed Stakes' || this.state.bet > 0) {
      createVote();
      this.setState({
        querySent: true
      });
    } else {
      this.setState({
        errorMsg: true
      })
    }
  };

  render() {
    const {classes} = this.props;
    const {parsedGame} = this.props.location.state;
    const gameView = parsedGame.resolved
      ?
      (
        <Fragment>
          <Card elevation={0} className={classes.optionSection}>
            <CardContent>
              <Typography className={classes.header} variant="display1" noWrap align="center">
                Results!
              </Typography>
              {
                parsedGame.voted ?
                  <Query query={GET_VOTE} variables={{gameId: parsedGame.id, withResult: true}}
                         fetchPolicy="cache-and-network" errorPolicy="ignore">
                    {({loading, error, data}) => {
                      if (loading) {
                        return (
                          <Paper elevation={0} className={classes.container}>
                            <div className={classes.content}>
                              <CircularProgress color="primary"/>
                            </div>
                          </Paper>
                        );
                      }
                      if (!data) {
                        return (
                          <Paper elevation={0} className={classes.container}>
                            <div className={classes.content}>
                              <img src={AngryHatperor} alt="Hatperor" className={classes.hatperor}/>
                              <Typography variant="display1" color="textSecondary">
                                Connection error!
                              </Typography>
                            </div>
                          </Paper>
                        );
                      }

                      const vote = data.vote;
                      return (
                        parsedGame.options.map((option, index) =>
                          <Card key={index}
                                className={option.result.winner ? classes.optionCard : classes.disabledOptionCard}>
                            <CardContent className={classes.voteOption}>
                              <Typography variant="body2" align="center"
                                          className={option.result.winner ? classes.chosenOptionText : classes.disabledOptionText}>
                                {option.body}
                              </Typography>

                              <Paper elevation={0} className={classes.voteBet}>
                                <div className={classes.headerDivider}/>
                                <Paper elevation={0} className={classes.result}>
                                  <Typography variant="display1">
                                    {parseOptionPercentage(option.result.totalValue, parsedGame.totalMoney)}
                                  </Typography>
                                  {
                                    option.id === vote.option.id &&
                                    <Fragment>
                                      <img alt="HattleCoin" src={HattleCoin} className={classes.coin}/>
                                      <Typography variant="title" className={classes.voteBetText}>
                                        {parseChange(vote.result.netChange)}
                                      </Typography>
                                    </Fragment>
                                  }
                                </Paper>
                              </Paper>
                            </CardContent>
                          </Card>
                        )
                      )
                    }}
                  </Query>
                  : (
                    parsedGame.options.map((option, index) =>
                      <Card key={index}
                            className={option.result.winner ? classes.optionCard : classes.disabledOptionCard}>
                        <CardContent className={classes.voteOption}>
                          <Typography variant="body2" align="center"
                                      className={option.result.winner ? classes.chosenOptionText : classes.disabledOptionText}>
                            {option.body}
                          </Typography>

                          <Paper elevation={0} className={classes.voteBet}>
                            <div className={classes.headerDivider}/>
                            <Paper elevation={0} className={classes.result}>
                              <Typography variant="display1">
                                {parseOptionPercentage(option.result.totalValue, parsedGame.totalMoney)}
                              </Typography>
                            </Paper>
                          </Paper>
                        </CardContent>
                      </Card>
                    ))
              }
            </CardContent>
          </Card>
        </Fragment>
      )
      : parsedGame.voted
        ?
        (
          <Fragment>
            <Card elevation={0} className={classes.optionSection}>
              <CardContent>
                <Typography className={classes.header} variant="display1" noWrap align="center">
                  Vote Submitted!
                </Typography>
                <Query query={GET_VOTE} variables={{gameId: parsedGame.id, withResult: false}}
                       fetchPolicy="cache-and-network" errorPolicy="ignore">
                  {({loading, error, data}) => {
                    if (loading) {
                      return (
                        <Paper elevation={0} className={classes.container}>
                          <div className={classes.content}>
                            <CircularProgress color="primary"/>
                          </div>
                        </Paper>
                      );
                    }
                    if (!data) {
                      return (
                        <Paper elevation={0} className={classes.container}>
                          <div className={classes.content}>
                            <img src={AngryHatperor} alt="Hatperor" className={classes.hatperor}/>
                            <Typography variant="display1" color="textSecondary">
                              Connection error!
                            </Typography>
                          </div>
                        </Paper>
                      );
                    }

                    const vote = data.vote;
                    return (
                      parsedGame.options.map((option, index) =>
                        <Card key={index}
                              className={option.id === vote.option.id ? classes.optionCard : classes.disabledOptionCard}>
                          <CardContent className={classes.voteOption}>
                            <Typography variant="body2" align="center"
                                        className={option.id === vote.option.id ? classes.chosenOptionText : classes.disabledOptionText}>
                              {option.body}
                            </Typography>
                            {
                              option.id === vote.option.id &&
                              <Paper elevation={0} className={classes.voteBet}>
                                <img alt="HattleCoin" src={HattleCoin} className={classes.coin}/>
                                <Typography variant="title" className={classes.voteBetText}>
                                  Bet: {vote.money}
                                </Typography>
                              </Paper>
                            }

                          </CardContent>
                        </Card>
                      )
                    )
                  }}
                </Query>
              </CardContent>
            </Card>
          </Fragment>
        )
        :
        (
          <Fragment>
            <Card elevation={0} className={classes.optionSection}>
              <CardContent>
                <Typography className={classes.header} variant="display1" noWrap align="center">
                  Choose One Option
                </Typography>
                {
                  parsedGame.options.map((option, index) =>
                    <Card key={index} className={classes.optionCard}>
                      <ButtonBase className={classes.button} onClick={() => this.handleChoice(option.id)}>
                        <CardContent>
                          <Typography variant="body2" align="center" className={classes.chosenOptionText}>
                            {option.body}
                          </Typography>
                        </CardContent>
                      </ButtonBase>
                    </Card>
                  )
                }
              </CardContent>
            </Card>
            {/* Dialog appears after option is chosen. */}
            <Mutation mutation={CREATE_VOTE} variables={{
              voteInput: {
                gameId: parsedGame.id,
                optionId: this.state.choice,
                amount: parsedGame.stakes === "Fixed Stakes" ? 100 : parseInt(this.state.bet, 10)
              }
            }}>
              {(createVote, {loading, error, called}) => (
                <Dialog
                  open={this.state.playDialog}
                  onClose={this.handleClose}
                  aria-labelledby="form-dialog-title"
                >
                  {called
                    ? loading
                      ? <CircularProgress className={classes.progress} size={50}/>
                      : error
                        ?
                        <DialogContent className={classes.queryDialog}>
                          <FontAwesomeIcon icon="exclamation-circle" size="5x" className={classes.failure}/>
                          <Typography variant="title" className={classes.dialogTitle} align="center">
                            Connection failed. Please try again!
                          </Typography>
                        </DialogContent>
                        :
                        <DialogContent className={classes.queryDialog}>
                          <FontAwesomeIcon icon="check-circle" size="5x" className={classes.success}/>
                          <Typography variant="title" className={classes.dialogTitle} align="center">
                            Your bet has been placed!
                          </Typography>
                        </DialogContent>
                    :
                    <Fragment>
                      <CancelButton closeHandler={this.handleClose}/>
                      <DialogContent>
                        <Typography variant="title" color="textPrimary" align="center">
                          {
                            parsedGame.stakes === "Fixed Stakes"
                              ? "You're about to bet 100 HattleCoins."
                              : "How many HattleCoins to bet?"
                          }
                        </Typography>
                        <Typography className={classes.dialogText} align="center">
                          HattleCoins are not refundable after submission!
                        </Typography>
                        {
                          parsedGame.stakes !== "Fixed Stakes" &&
                          <TextField
                            autoFocus
                            autoComplete="off"
                            id="amount"
                            type="number"
                            fullWidth
                            className={classes.moneyInput}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <img alt="HattleCoin" src={HattleCoin} className={classes.coin}/>
                                </InputAdornment>
                              ),
                              disableUnderline: true,
                              inputProps: {
                                min: '1'
                              }
                            }}
                            value={this.state.bet}
                            onChange={this.handleChange('bet')}
                          />
                        }
                        {
                          this.state.errorMsg &&
                          <Typography className={classes.errorMsg}>
                            Please provide a valid bet amount.
                          </Typography>
                        }
                        <SubmitButton submitHandler={() => this.handleSubmit(createVote, parsedGame.stakes)}/>
                      </DialogContent>
                    </Fragment>
                  }
                </Dialog>
              )}
            </Mutation>
          </Fragment>
        );
    return (
      <div className={classes.fullHeight}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              className={classes.backButton} color="inherit" aria-label="Back"
              component={Link} to="/games"
            >
              <FontAwesomeIcon icon="arrow-left" size="sm"/>
            </IconButton>
            <Typography className={classes.header} variant="display2" noWrap>
              G
            </Typography>
            <Typography className={classes.header} variant="display1" noWrap>
              ame
            </Typography>
            <div className={classes.grow}/>
          </Toolbar>
        </AppBar>

        <div>
          <Card className={classes.questionCard} elevation={0}>
            <CardContent className={classes.cardContentRow}>
              <CardContent className={classes.poster}>
                <Avatar
                  alt="Profile Pic"
                  src={parsedGame.owner.img}
                  className={classes.avatar}
                />
                <Typography variant="title">
                  {parsedGame.owner.name}
                </Typography>
              </CardContent>
              <Query query={GET_PROFILE} fetchPolicy="cache-and-network" errorPolicy="ignore">
                {({loading, error, data}) => {
                  let userMoney = (data && data.user) ? data.user.money : "???";
                  return (
                    <Currency money={userMoney}/>
                  )
                }}
              </Query>
            </CardContent>

            <Paper elevation={0} className={classes.pot}>
              <img alt="Pot" src={Money} className={classes.moneyBag}/>
              <Typography className={classes.potText}>
                {parsedGame.totalMoney} in the pot!
              </Typography>
            </Paper>

            <CardContent>
              <Typography className={classes.cardTitle} variant="title">
                {parsedGame.topic}
              </Typography>
            </CardContent>

            <CardContent className={classes.cardContentRow}>
              <Paper elevation={0} className={classes.cardInfo}>
                <img alt="Game Mode" src={Dice} className={classes.dice}/>
                <Typography color="textPrimary" className={classes.textInfo}>
                  {parsedGame.gameMode}
                </Typography>
              </Paper>
              <Paper elevation={0} className={classes.cardInfo}>
                <FontAwesomeIcon icon="coins" size="1x" className={classes.icon}/>
                <Typography color="textPrimary" className={classes.textInfo}>
                  {parsedGame.stakes}
                </Typography>
              </Paper>
              <Paper elevation={0} className={classes.cardInfo}>
                <FontAwesomeIcon icon="hourglass-half" size="1x" className={classes.icon}/>
                <Typography color="textPrimary" className={classes.textInfo}>
                  {parsedGame.timeLeft}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
          {
            gameView
          }
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(GameScreen);