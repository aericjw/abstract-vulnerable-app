import React from 'react'
import autobind from 'react-autobind'

class Steal extends React.Component{
    constructor(props){
        super(props)
        autobind(this)
    }

    render(){
        return(
            <button onClick={this.props.onClick}>Steal</button>
        )
    }
}

export default Steal