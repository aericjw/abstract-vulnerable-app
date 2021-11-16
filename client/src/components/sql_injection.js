import React from 'react'
import autobind from 'react-autobind';

class SQLInjection extends React.Component{
    constructor(props){
        super(props);
        autobind(this);
    };

    render() {
        return(
            <button onClick={this.props.onClick}>SQL Injection</button>
        )
    }
}
export default SQLInjection