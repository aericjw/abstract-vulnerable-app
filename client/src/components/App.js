import React from 'react'
import '../css/App.css';
import SQLInjection from './sql_injection';
import Logout from './logout';
import Steal from './steal';
import Next from './next';
import {sendServerRequestGET, sendServerRequestPOST, sendServerRequestPUT, getOriginalServerPort} from '../utils/rest_api'
import autobind from 'react-autobind';

class App extends React.Component {
  constructor(props){
    super(props)
    autobind(this)
    this.state = {
      pageType: "attack",
      attackType: "",
      amountStolen: 0,
      timeLeft: 0, 
    }
  }
  // Attack Methods
  sql_request(){ // Send HTTP GET to mimic SQL Injection that returns the first account
    let requestBody = {
      "requestType": "sql_inject"
    };
    sendServerRequestGET(requestBody, getOriginalServerPort()).then(
      (res) => console.log(res.data)
    );
    this.setState({pageType: "options", attackType: "SQL"})
  }

  // Option Methods

  logout(){ // Send update to server that we are logging out and go back to first page
    this.setState({pageType: "attack", amountStolen: 0, timeLeft: 0})
  }

  steal(){
    let requestBody = {
      "requestType": "steal",
      "attackType": this.state.attackType,
    };
    sendServerRequestPUT(requestBody, getOriginalServerPort()).then(
      (res) => {
        console.log(res.data)
        this.setState({amountStolen: res.data.balance})
      }
    )
  }

  next(){
    let requestBody = {
      "requestType": "next",
      "attackType": this.state.attackType,
    }
    sendServerRequestGET(requestBody, getOriginalServerPort()).then(
      (res) => {
        console.log(res.data)
      }
    )
  }

  // Button render methods

  render_attacks(){
    return (
      <span>
        <SQLInjection onClick={this.sql_request}/>
        <button>Placeholder</button>
      </span>
    )
  }

  render_options(){
    return (
      <span>
        <Steal onClick={this.steal}/>
        <Logout onClick={this.logout}/>
        <Next onClick={this.next}/>
      </span>
    )
  }

  page_handler(){
    if (this.state.pageType === "attack"){
      return this.render_attacks()
    }
    else if (this.state.pageType === "options"){
      return this.render_options()
    }
  }

  render(){
    return (
      <div className="App">
        <header className="App-header">
          {this.page_handler()}
        </header>
      </div>
    );
  }
}

export default App;
