import React from 'react'
import DefaultButton from './defaultButton';
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
      chanceDetect: 0,
      isDetected: false,
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
          timeLeft: this.state.timeLeft - 3,
          chanceDetect: this.state.chanceDetect + 5
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
          timeLeft: this.state.timeLeft - 3,
          chanceDetect: this.state.chanceDetect + 5
        })
      }
    );
  }

  // Option Methods

  logout(){ // Send update to server that we are logging out and go back to first page
    if (this.state.pageType === "zero" || (this.state.timeLeft > 0 && this.state.pageType === "options")){
      this.setState({pageType: "success"})
    }
    else {
      this.setState({
        pageType: "attack",
        attackType: "",
        accountNumber: -1,
        amountStolen: 0,
        amountToSteal: 0,
        timeLeft: 10,
        chanceDetect: 0,
      })
    }
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
          chanceDetect: this.state.chanceDetect + 10,
          amountToSteal: res.data.nextAccount.balance},
          () => {
            console.log(this.state)
            this.hasTimeExpired()
            this.hasBeenDetected()
            }
        )
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
        }, () => {
          console.log(this.state)
          this.hasTimeExpired()
          }
        )
      }
    )
  }

  hasTimeExpired(){
    if (this.state.timeLeft < 0){
      console.log("Attacker was caught")
      this.setState({pageType: "failure", timeLeft: 0})
    }
    else if(this.state.timeLeft === 0){
      console.log("Logout?")
      this.setState({pageType: "zero"})
    }
  }

  hasBeenDetected(){
    if (this.state.chanceDetect >= 100){
      this.setState({isDetected: true})
    }
    else {
      this.setState({isDetected: Math.random() < (this.state.chanceDetect / 100)})
    }

    if (this.state.isDetected) {
      console.log("Attacker was caught")
      this.setState({pageType: "failure", chanceDetect: 100})
    }
  }

  // Button render methods

  render_attacks(){
    return (
      <>
        <h1 className="pb-2">{"How do you want to attack?"}</h1>
        <div className="grid grid-rows-1 grid-flow-col grid-cols-2 gap-2">
            <DefaultButton onClick={this.sql_request}>SQL Injection</DefaultButton>
            <DefaultButton onClick={this.xss}>XSS Attack</DefaultButton>
        </div>
      </>
    )
  }

  render_options(disabled){
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className="grid grid-flow-row grid-rows-3 grid-cols-1 gap-2">
          <DefaultButton disabled={disabled} onClick={this.steal}>Withdraw</DefaultButton>
          <DefaultButton disabled={disabled} onClick={this.next}>Next</DefaultButton>
          <DefaultButton onClick={this.logout}>Logout</DefaultButton>
        </div>
        <div className="col-span-2">
          <div className="grid grid-flow-row grid-rows-3 grid-cols-1">
            <p className="p-2 text-left text-xl text-white font-medium bg-black rounded-t-xl">{"Account #" + this.state.accountNumber}</p>
            <p className="p-2 text-left text-lg font-medium bg-white">{"Balance:"}</p>
            <p className="p-2 text-right text-2xl font-bold bg-white rounded-b-xl">{"$" + this.state.amountToSteal}</p>
          </div>
        </div>
      </div>
    )
  }

  page_handler(){
    if (this.state.pageType === "attack"){
      return this.render_attacks()
    }
    else if (this.state.pageType === "options"){
      return this.render_options(false)
    }
    else if (this.state.pageType === "zero"){
      return this.render_options(true)
    }
    else if (this.state.pageType === "failure"){
      return (
        <div className="p-8 text-center">
          <p className="p-2">You were caught!</p>
          <DefaultButton onClick={() => this.logout()}>Start Over</DefaultButton>
        </div>
      )
    }
    else if (this.state.pageType === "success"){
      return (
        <div className="p-8 text-center">
          <p className="p-2">Congrats! You escaped successfully</p>
          <DefaultButton onClick={() => this.logout()}>Start Over</DefaultButton>
        </div>
      )
    }
  }

  render_title(){
    return (
      <div className="p-2 bg-green-400 text-center text-black rounded-t-xl">
        <p>Vulnerable Banking App</p>
      </div>
    )
  }

  render_stats(){
    return (
      <>
        <div className="p-2 bg-red-400 text-center text-black rounded-t-xl">
          <p>Attack Stats</p>
        </div>
        <div className="p-2 bg-gray-300 text-center text-black rounded-b-xl">
          <p>{"Amount Stolen: $" + this.state.amountStolen}</p>
          <p>{"Time Left: " + this.state.timeLeft + " mins"}</p>
          <p>{"Chance of Detection: " + this.state.chanceDetect + "%"}</p>
        </div>
      </>
    )
  }

  render(){
    return (
      <>
        <div className="pt-8 container mx-auto text-center">
          {this.render_title()}
        </div>
        <div className="p-2 container mx-auto bg-gray-300 rounded-b-xl text-center">
          {this.page_handler()}
        </div>
        <div className="pt-8 container mx-auto text-center">
          {this.render_stats()}
        </div>
      </>
    );
  }
}

export default App;