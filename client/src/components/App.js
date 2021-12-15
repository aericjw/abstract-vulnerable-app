import React from 'react'
import DefaultButton from './defaultButton';
import {sendServerRequestGET, sendServerRequestPUT, getOriginalServerPort} from '../utils/rest_api'
import autobind from 'react-autobind';

class App extends React.Component {
  constructor(props){
    super(props)
    autobind(this)
    this.state = {
      pageType: "instruction",
      attackType: "",
      accountNumber: -1,
      amountStolen: 0,
      amountToSteal: 0,
      timeLeft: 20,
      chanceDetect: 0,
      isDetected: false,
      static: true,
      accounts: [
        [1, 1, "Savings", 100000000],
        [2, 1, "Checking", 100000],
        [3, 2, "Savings", 1500000],
        [4, 2, "Checking", 200000],
        [5, 3, "Savings", 2000000],
        [6, 3, "Checking", 40000],
        [7, 4, "Savings", 1000],
        [8, 4, "Checking", 800],
        [9, 5, "Checking", 2000],
        [10, 6, "Checking", 300000],
        [11, 7, "Savings", 20000],
        [12, 7, "Checking", 3600],
        [13, 8, "Savings", 500],
        [14, 8, "Checking", 200],
        [15, 9, "Savings", 45000],
        [16, 10, "Savings", 75000],
        [17, 10, "Checking", 15000]
      ],
      indexes: []
    }
  }

  // Attack Methods

  sql_request(){ // Send HTTP GET to mimic SQL Injection that returns the first account
    if(this.state.static) {
      this.setState({
        pageType: "options", 
        attackType: "SQL",
        accountNumber: this.state.accounts[0][0],
        amountToSteal: this.state.accounts[0][3], 
        timeLeft: this.state.timeLeft - 3,
        chanceDetect: this.state.chanceDetect + 5
      })
    }
    else {
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
  }

  xss(){
    if(this.state.static) {
      let randomIndex = Math.floor(Math.random() * 17)
      this.state.indexes.push(randomIndex)
      this.setState({
        pageType: "options", 
        attackType: "XSS",
        accountNumber: this.state.accounts[randomIndex-1][0],
        amountToSteal: this.state.accounts[randomIndex-1][3], 
        timeLeft: this.state.timeLeft - 3,
        chanceDetect: this.state.chanceDetect + 5
      })
    }
    else {
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
        timeLeft: 20,
        chanceDetect: 0,
        isDetected: false,
        indexes: []
      })
    }
  }

  steal(){
    if(this.state.static){
      if (this.state.attackType === "SQL"){
        let currentAccount = this.state.accountNumber
        let nextAccount = (currentAccount + 1 > 16) ? 1 : currentAccount + 1
        console.log("Current: " + currentAccount)
        console.log("Next: " + nextAccount)
        this.setState({
          amountStolen: this.state.amountStolen + this.state.amountToSteal,
          accountNumber: nextAccount, 
          timeLeft: this.state.timeLeft - 2,
          chanceDetect: this.state.chanceDetect + 10,
          amountToSteal: this.state.accounts[nextAccount-1][3]},
          () => {
            console.log(this.state)
            this.hasTimeExpired()
            this.hasBeenDetected()
            }
        )
    }
      else if (this.state.attackType === "XSS"){
        let randomIndex = Math.floor(Math.random() * 17)
        if (this.state.indexes.includes(randomIndex)){
          while(this.state.indexes.includes(randomIndex)){
            randomIndex = Math.floor(Math.random() * 17)
          }
          this.state.indexes.push(randomIndex)
        }
        else{
          this.state.indexes.push(randomIndex)
        }
        console.log("RandomIndex: " + randomIndex)
        let nextAccount = randomIndex
        this.setState({
          amountStolen: this.state.amountStolen + this.state.amountToSteal,
          accountNumber: nextAccount, 
          timeLeft: this.state.timeLeft - 2,
          chanceDetect: this.state.chanceDetect + 10,
          amountToSteal: this.state.accounts[nextAccount-1][3]},
          () => {
            console.log(this.state)
            this.hasTimeExpired()
            this.hasBeenDetected()
            }
        )
      }
    }
    else {
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
  }

  next(){
    if (this.state.static) {
      if (this.state.attackType === "SQL"){
        let currentAccount = this.state.accountNumber
        let nextAccount = (currentAccount + 1 > 16) ? 1 : currentAccount + 1
        this.setState({
          accountNumber: nextAccount, 
          timeLeft: this.state.timeLeft - 2,
          amountToSteal: this.state.accounts[nextAccount-1][3]},
          () => {
            console.log(this.state)
            this.hasTimeExpired()
            this.hasBeenDetected()
            }
        )
    }
      else if (this.state.attackType === "XSS"){
        let randomIndex = Math.floor(Math.random() * 17)
        if (this.state.indexes.includes(randomIndex)){
          while(this.state.indexes.includes(randomIndex)){
            randomIndex = Math.floor(Math.random() * 17)
          }
          this.state.indexes.push(randomIndex)
        }
        else{
          this.state.indexes.push(randomIndex)
        }
        let nextAccount = randomIndex
        this.setState({
          accountNumber: nextAccount, 
          timeLeft: this.state.timeLeft - 2,
          amountToSteal: this.state.accounts[nextAccount-1][3]},
          () => {
            console.log(this.state)
            this.hasTimeExpired()
            this.hasBeenDetected()
            }
        )
      }
    }
    else {
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
        <div className="grid grid-rows-1 grid-flow-cli grid-clis-2 gap-2">
            <DefaultButton onClick={this.sql_request}>SQL Injection</DefaultButton>
            <DefaultButton onClick={this.xss}>XSS Attack</DefaultButton>
        </div>
      </>
    )
  }

  render_options(disabled){
    return (
      <div className="grid grid-clis-3 gap-2">
        <div className="grid grid-flow-row grid-rows-3 grid-clis-1 gap-2">
          <DefaultButton disabled={disabled} onClick={this.steal}>Withdraw</DefaultButton>
          <DefaultButton disabled={disabled} onClick={this.next}>Next</DefaultButton>
          <DefaultButton onClick={this.logout}>Logout</DefaultButton>
        </div>
        <div className="cli-span-2">
          <div className="grid grid-flow-row grid-rows-3 grid-clis-1">
            <p className="p-2 text-left text-xl text-white font-medium bg-black rounded-t-xl">{"Account #" + this.state.accountNumber}</p>
            <p className="p-2 text-left text-lg font-medium bg-white">{"Balance:"}</p>
            <p className="p-2 text-right text-2xl font-blid bg-white rounded-b-xl">{"$" + this.state.amountToSteal}</p>
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

  render_instructions(){
    return (
      <div className='pt-8 container mx-auto text-center'>
        <div className="p-2 bg-blue-400 text-center text-black rounded-t-xl">
          <p>Instructions</p>
        </div>
        <div className="p-2 bg-gray-300 text-black rounded-b-xl">
          <p className='text-center'>Welcome to our vulnerable banking app! (abstracted version)</p>
          <p className='text-center'>
            As a way to demonstrate our concept for a research platform we developed an abstract version
            of a vulnerable app that hackers would break into and steal money from.
          </p>
          <p>
            Our game is quite simple.
          </p>
          <br></br>
          <p className='text-center'>Your goal is to steal as much money as you can without getting caught, but there are a few rules:</p>
          <br></br>
          <ul className='list-decimal pl-5 text-left'>
            <li>You have 20 "minutes" to achieve your goal</li>
            <li>You must choose your method of attack. An SQL injection will go through each bank account to steal from sequentially, while an XSS attack will pick random bank accounts to steal from</li>
            <li>Each attack will take 3 "minutes" and as well raise your chances of getting caught</li>
            <li>You will then be presented with a bank account and the options: "Withdraw" (stealing), "Next" (skipping) or "Log Out" (escape)</li>
            <li>Stealing will take 2 "minutes" and skipping will take 1 "minute"</li>
            <li>Your chances of getting caught go up for stealing. Your chances remain the same if you skip the account</li>
            <li>Logging out finishes the game. You would want to do this if you feel like you have stolen enough money or feel like your chances of getting caught are too high</li>
            <li>It is random chance you are caught based on your probability displayed in the "Attack Stats" section, and if you run out of time you will also be caught</li>
          </ul>
          <br></br>
          <p className='text-center'>A note about future work:</p>
          <br></br>
          <p className='text-left'>
            In this current stage, this is a static web app. It is not connect to a server or database for demonstration purposes.
            In reality we want to build a functional web application that mimics a real-world banking application but is extremely vulnerable.
            Vulnerable applications exist for white-hat hackers of various expertises to test and review their skills. It would be nice to use these but they are not fitted to our research
            since they don't have a real-life context and are often giving instructions on how to break them. While we may use similar ideas to these vulnerable applications we felt it would be best
            to have something more custom that can work and be flexible for whichever direction our research goes.
          </p>
          <DefaultButton onClick={() => this.setState({pageType: "attack"})}>Start!</DefaultButton>
        </div>
      </div>
    )
  }

  render(){
    if(this.state.pageType === "instruction") {
      return (
        <>
          {this.render_instructions()}
        </>
      )
    }
    else {
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
}

export default App;