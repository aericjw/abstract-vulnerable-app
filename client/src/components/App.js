import React from 'react'
import '../css/App.css';
import SQLInjection from './sql_injection';
import {sendServerRequestGET, sendServerRequestPOST, getOriginalServerPort} from '../utils/rest_api'
import autobind from 'react-autobind';

class App extends React.Component {
  constructor(props){
    super(props)
    autobind(this)
  }

  sql_request(){ // Send HTTP GET to mimic SQL Injection that returns the first account
    let requestBody = {
      "requestType": 'sql_inject'
    };
    sendServerRequestGET(requestBody, getOriginalServerPort()).then(
      (res) => console.log(res.data)
    );
  }

  render(){
    return (
      <div className="App">
        <header className="App-header">
          <SQLInjection onClick={this.sql_request}/>
        </header>
      </div>
    );
  }
}

export default App;
