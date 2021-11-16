import React from 'react'
import autobind from 'react-autobind'

class Logout extends React.Component{
    constructor(props){
        super(props)
        autobind(this)
    }

    render(){
        return(
            <button onClick={this.props.onClick}>Log Out</button>
        )
    }
}

export default Logout