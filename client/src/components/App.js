import React from 'react'
import '../css/App.css';
import SQLInjection from './sql_injection';
import XSS from './xss';
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
      accountNumber: -1,
      amountStolen: 0,
      amountToSteal: 0,
      timeLeft: 10, 
    }
  }

  // Attack Methods

  sql_request(){ // Send HTTP GET to mimic SQL Injection that returns the first account
    let requestBody = {
      "requestType": "sql_inject"
    };
    sendServerRequestGET(requestBody, getOriginalServerPort()).then(
      (res) => {
        console.log(res.data)
        this.setState({
          pageType: "options", 
          attackType: "SQL",
          accountNumber: res.data.account,
          amountToSteal: res.data.balance, 
          timeLeft: this.state.timeLeft - 3
        })
      }
    );
  }

  xss(){
    let requestBody = {
      "requestType": "xss"
    }
    sendServerRequestGET(requestBody, getOriginalServerPort()).then(
      (res) => {
        console.log(res.data)
        this.setState({
          pageType: "options", 
          attackType: "XSS",
          accountNumber: res.data.account,
          amountToSteal: res.data.balance, 
          timeLeft: this.state.timeLeft - 3
        })
      }
    );
  }

  // Option Methods

  logout(){ // Send update to server that we are logging out and go back to first page
    this.setState({
      pageType: "attack",
      attackType: "",
      accountNumber: -1,
      amountStolen: 0,
      amountToSteal: 0,
      timeLeft: 10, 
    })
  }

  steal(){
    let requestBody = {
      "requestType": "steal",
      "attackType": this.state.attackType,
      "account": this.state.accountNumber,
    };
    sendServerRequestPUT(requestBody, getOriginalServerPort()).then(
      (res) => {
        console.log(res.data)
        this.setState({
          amountStolen: this.state.amountStolen + res.data.currentAccount.balance,
          accountNumber: res.data.nextAccount.account, 
          timeLeft: this.state.timeLeft - 2, 
          amountToSteal: res.data.nextAccount.balance},
          () => console.log(this.state))
      }
    )
  }

  next(){
    let requestBody = {
      "requestType": "next",
      "attackType": this.state.attackType,
      "account": this.state.accountNumber,
    }
    sendServerRequestPUT(requestBody, getOriginalServerPort()).then(
      (res) => {
        console.log(res.data)
        this.setState({
          accountNumber: res.data.nextAccount.account,
          timeLeft: this.state.timeLeft - 1,
          amountToSteal: res.data.nextAccount.balance,
        }, () => console.log(this.state))
      }
    )
  }

  // Button render methods

  render_attacks(){
    return (
      <>
        <h1>{"How do you want to attack?"}</h1>
        <span>
          <SQLInjection onClick={this.sql_request}/>
          <XSS onClick={this.xss}/>
        </span>
      </>
    )
  }

  render_options(){
    return (
      <>
        <h1>{"Amount Stolen: $" + this.state.amountStolen}</h1>
        <h1>{"Account Number: " + this.state.accountNumber}</h1>
        <h1>{"Balance: $" + this.state.amountToSteal}</h1>
        <h1>{"Time Left: " + this.state.timeLeft + " mins"}</h1>
        <span>
          <Steal onClick={this.steal}/>
          <Next onClick={this.next}/>
          <Logout onClick={this.logout}/>
        </span>
      </>
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
