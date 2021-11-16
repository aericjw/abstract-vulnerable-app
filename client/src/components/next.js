import React from 'react'
import autobind from 'react-autobind'

class Next extends React.Component{
    constructor(props){
        super(props)
        autobind(this)
    }

    render(){
        return(
            <button onClick={this.props.onClick}>Next</button>
        )
    }
}

export default Next