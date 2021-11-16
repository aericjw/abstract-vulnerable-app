import React from 'react'
import autobind from 'react-autobind';

class XSS extends React.Component{
    constructor(props){
        super(props);
        autobind(this);
    };

    render() {
        return(
            <button onClick={this.props.onClick}>XSS</button>
        )
    }
}
export default XSS