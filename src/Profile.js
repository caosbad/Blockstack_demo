import React, { Component } from "react";
import { Person } from "blockstack";

const avatarFallbackImage =
  "https://s3.amazonaws.com/onename/avatar-placeholder.png";

export default class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      person: {
        name() {
          return "Anonymous";
        },
        avatarUrl() {
          return avatarFallbackImage;
        }
      },
      state: {
        text: "",
        createdAt: 0
      }
    };
  }

  submitState = () => {
    const { state } = this.state;
    const { userSession } = this.props;
    const time = new Date();
    state.createdAt = time;
    this.setState({
      state
    });

    userSession
      .putFile("state.json", JSON.stringify(state), { encrypt: false })
      .then(() => {
        this.setState({
          state: {
            text: "",
            createdAt: 0
          }
        });
        this.getServerData();
      });
  };

  textChange = e => {
    const val = e.target.value;
    this.setState({
      state: {
        text: val
      }
    });
  };

  getServerData = () => {
    const { userSession } = this.props;
    userSession.getFile("state.json", { decrypt: false }).then(res => {
      console.log(res);
      if (!res) return;
      this.setState({
        serverState: JSON.parse(res)
      });
    });
  };

  render() {
    const { handleSignOut, userSession } = this.props;
    const { person, serverState, state } = this.state;

    return !userSession.isSignInPending() ? (
      <div className="panel-welcome" id="section-2">
        <div className="avatar-section">
          <img
            src={person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage}
            className="img-rounded avatar"
            id="avatar-image"
            alt=""
          />
        </div>
        <h1>
          Hello,{" "}
          <span id="heading-name">
            {person.name() ? person.name() : "Nameless Person"}
          </span>
          !
        </h1>
        <p>
          Description:{" "}
          <span id="heading-name">
            {person.description() ? person.description() : "Nothing"}
          </span>
          !
        </p>
        <p className="lead">
          <button
            className="btn btn-primary btn-lg"
            id="signout-button"
            onClick={handleSignOut.bind(this)}
          >
            Logout
          </button>
        </p>
        <input value={state.text} onChange={e => this.textChange(e)}></input>
        <br />
        <button
          className="btn btn-primary btn-lg"
          onClick={e => this.submitState(e)}
        >
          提交
        </button>
        {serverState && <p>server state is : {serverState.text}</p>}
      </div>
    ) : null;
  }

  componentDidMount() {
    this.getServerData();
  }
  componentWillMount() {
    const { userSession } = this.props;
    this.setState({
      person: new Person(userSession.loadUserData().profile)
    });
  }
}
