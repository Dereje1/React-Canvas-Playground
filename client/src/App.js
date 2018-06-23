import React, { Component } from 'react';
import './App.css';

class App extends Component{
  constructor(props){
    super(props)
    this.state={ //determine what needs to go into state, a very small portion here
      canvasWidth:640,
      canvasHeight:425,
      xPosition:20,
      yPosition:20,
      rectWidth:150,
      rectHeight:50,
      timerInterval:300,
      xIncrement:10,
      yIncrement:5,
      rotationStage:0
    }
  }
  componentDidMount(){
    const canvas = this.refs.canvas
    canvas.style.backgroundColor = "black";
    //setting context so it can be accesible everywhere in the class , maybe a better way ?
    this.canvasContext = canvas.getContext('2d') 
    this.resetBoard()
  }
  
  resetBoard =() =>{ //clear and restart
    clearInterval(this.downInterval) //clear timer
    this.removeRect() //clear canvas
    this.setState({
      xPosition:20,
      yPosition:40,
      rectWidth:150,
      rectHeight:50,
      rotationStage:0
    })
    this.drawShape()
    //restart timer
    this.downInterval = setInterval(()=>{
      this.computerMove()
    },this.state.timerInterval)
  }
  
  drawShape = () =>{
    this.canvasContext.beginPath()
    this.canvasContext.fillStyle ="red";
    this.canvasContext.moveTo(this.state.xPosition,this.state.yPosition)
    this.canvasContext.lineTo(this.state.xPosition + this.state.rectWidth, this.state.yPosition)
    this.canvasContext.lineTo(this.state.xPosition + this.state.rectWidth, this.state.yPosition + this.state.rectHeight)
    this.canvasContext.lineTo(this.state.xPosition, this.state.yPosition + this.state.rectHeight)
    this.canvasContext.lineTo(this.state.xPosition,this.state.yPosition)
    this.canvasContext.fill();
  }
  //downward moevent only
  computerMove =()=>{
    this.removeRect()
    if(this.state.yPosition + this.state.rectHeight >= this.state.canvasHeight){
      this.resetBoard()
    }
    else{
      this.setState({
        yPosition: this.state.yPosition + this.state.yIncrement
      },()=>this.drawShape())
    }
  }
  
  rotation = (direction) =>{
    console.log(`We'll do ${direction} rotation here`)
    
    this.removeRect()
    /*Trig coordinate transformation formula
    x′=(x−p)cos(θ)−(y−q)sin(θ)+p,
    y′=(x−p)sin(θ)+(y−q)cos(θ)+q.
    where (p,q) origin point of transformation, and (x,y) are pre-transffered points
    https://math.stackexchange.com/questions/270194/how-to-find-the-vertices-angle-after-rotation
    */
    
    const theta=90*Math.PI/180
    const p = this.state.xPosition + this.state.rectWidth/2
    const q = this.state.yPosition + this.state.rectHeight/2
    const xPrime = (this.state.xPosition - p)* Math.cos(theta)-
        ((this.state.yPosition + this.state.rectHeight) - q)* Math.sin(theta)+
        p
    const yPrime = (this.state.xPosition - p)* Math.sin(theta)-
        ((this.state.yPosition + this.state.rectHeight) - q)* Math.cos(theta)+
        q
    
    this.setState({
      xPosition: xPrime,
      yPosition: yPrime,
      rectWidth: this.state.rectHeight,
      rectHeight: this.state.rectWidth,
      rotationStage: this.state.rotationStage > 2 ? 0 : this.state.rotationStage + 1
    },()=>this.drawShape())
    
  }
  //left right movement only
  playerMove = (e)=>{
    const left = e.keyCode===37
    const right = e.keyCode===39
    const up = e.keyCode===38
    const down = e.keyCode===40
    
    if(!(left||right||up||down)) return //do nothing for any other keypress
  
    //check X boundaries 
    const leftOutOfBound = left && (this.state.xPosition - this.state.xIncrement) < 0
    const rightOutOfBound = right && (this.state.xPosition + this.state.xIncrement + this.state.rectWidth) > this.state.canvasWidth
    if(leftOutOfBound || rightOutOfBound) return
    
    if(left){
      this.removeRect()
      this.setState({
        xPosition: this.state.xPosition - this.state.xIncrement
      },()=>this.drawShape())
    }
    else if(right){
      this.removeRect()
      this.setState({
        xPosition: this.state.xPosition + this.state.xIncrement
      },()=>this.drawShape())
    }
    else{
      up ? this.rotation("CCW") : this.rotation("CW")
    }
  }
  //clear canvas
  removeRect = ()=>{
    this.canvasContext.clearRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
  }
  
  render(){
    return(
      <div className="containall">
      <canvas 
        ref="canvas" 
        width={this.state.canvasWidth} 
        height={this.state.canvasHeight} 
        tabIndex="0"
        onKeyDown={(e)=>this.playerMove(e)}
        />
      <button className="reset" onClick={()=>this.resetBoard()}>
        Reset
       </button>
      </div>
    )
  }
}

export default App;
