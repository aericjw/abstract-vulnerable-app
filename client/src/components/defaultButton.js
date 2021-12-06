import React from 'react'
import autobind from 'react-autobind'
import "../css/index.css"

class DefaultButton extends React.Component{
    constructor(props){
        super(props)
        autobind(this)
    }

    render(){
        return(
            <button className="p-2 rounded-xl bg-white"onClick={this.props.onClick}>{this.props.children}</button>
        )
    }
}

export default DefaultButton