import '../css/App.css';
import SQLInjection from './sql_injection';
import {sendServerRequest, getOriginalServerPort} from '../utils/rest_api'

function request(){ // Send HTTP GET to mimic SQL Injection that returns the first account
  let requestBody = {
    "requestType": 'sql_inject'
  };
  sendServerRequest(requestBody, getOriginalServerPort()).then(
    (res) => console.log(res.data)
  );
}

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <SQLInjection onClick={request}/>
      </header>
    </div>
  );
  
}

export default App;
