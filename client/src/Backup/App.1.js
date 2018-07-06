import React, { Component } from 'react';
import './App.css';

import { tetrisShapes } from './shapes'
class App extends Component{
  constructor(props){
    super(props)
    this.state={ //determine what needs to go into state, a very small portion here
      canvasWidth:640,
      canvasHeight:640,
      timerInterval:700,
      xIncrement:40,
      yIncrement:40,
      occupiedCells:[],
      activeShape:{
        name:'shapeZ',
        xPosition:0,
        yPosition:0,
        unitVertices:[],
        boundingBox:[],
        rotationStage:0,
      }
    }
  }
  componentDidMount(){
    const canvas = this.refs.canvas
    canvas.style.backgroundColor = "black";
    //setting context so it can be accesible everywhere in the class , maybe a better way ?
    this.canvasContext = canvas.getContext('2d') 
    this.lastRefresh = 0
    this.resetBoard(true)
  }

  componentWillUnmount() {
    clearInterval(this.downInterval)
  }
  
  tick = () => {

  }

  screenMatrix = () => {
    const b = tetrisShapes.blockSize
    const blocksPerRow = this.state.canvasWidth / b
    let cell = 0;
    for(let i=0;i < blocksPerRow ; i++){
      for(let j=0; j< blocksPerRow ; j++){
        cell++
        const x = [i*b,(i*b)+b]
        const y = [j*b,(j*b)+b]
        let col ='white'
        const xIncluded = (x[0] >= this.state.activeShape.boundingBox[0])&&(x[1] <= this.state.activeShape.boundingBox[1])
        const yIncluded = (y[0] >= this.state.activeShape.boundingBox[2])&&(y[1] <= this.state.activeShape.boundingBox[3])
        if(xIncluded && yIncluded){
          col = 'green'
          this.setState({
            occupiedCells:[...this.state.occupiedCells,cell]
          })
        }
        this.canvasContext.beginPath();
        this.canvasContext.lineWidth="3";
        this.canvasContext.strokeStyle=col;
        this.canvasContext.rect(x[0],y[0],b,b); 
        this.canvasContext.stroke();
      }
    }
  }
  resetBoard =(fresh=false) =>{ //clear and restart
    if(fresh) this.screenMatrix()
     //clear timer
    this.clearCanvas() //clear canvas
    const randomShape = this.getRandomShape()
    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    if(randomShape[0] !== 'shapeI' && randomShape[0] !== 'shapeO'){
      copyOfActiveShape.xPosition = (this.state.canvasWidth/2) + 20
    }
    else{
      copyOfActiveShape.xPosition = (this.state.canvasWidth/2)
    }
    copyOfActiveShape.name = randomShape[0]
    copyOfActiveShape.yPosition = -1*randomShape[1]
    copyOfActiveShape.rotationStage = 0
    copyOfActiveShape.unitVertices = tetrisShapes[copyOfActiveShape.name].vertices
    this.setState({
      activeShape: copyOfActiveShape
    },()=>this.drawShape(fresh))
    
    //restart timer
    
  }
  
  getRandomShape = () =>{
    const shapeList = ['shapeL','shapeZ','shapeT','shapeI','shapeJ','shapeO','shapeS']
    const randNum = Math.floor(Math.random() * (shapeList.length));
    //finding intital y bound so it does not get cutoff 
    const pickedShape = shapeList[randNum]
    const initialScaledVertices = tetrisShapes.scaleVertices(tetrisShapes[pickedShape].vertices)
    const initialBoundingBox = tetrisShapes.onBoundingBox(this.state.canvasWidth/2,0,initialScaledVertices)
    
    return [pickedShape,initialBoundingBox[2]]
  }
  drawShape = (fresh = false) =>{
    
    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    //console.log(this.state.activeShape.xPosition,this.state.activeShape.yPosition,this.state.activeShape.rotationStage,this.state.activeShape.boundingBox)
    copyOfActiveShape.boundingBox = tetrisShapes.onDraw(this.canvasContext,this.state.activeShape)

    this.setState({
      activeShape: copyOfActiveShape
    },()=>{
      this.screenMatrix()
      if(fresh){
        this.downInterval = requestAnimationFrame(this.computerMove)
      }
      else{
        requestAnimationFrame(this.computerMove)
      }
    })
  }
  //downward moevent only
  computerMove =(currentRefreshTime)=>{
    if((currentRefreshTime-this.lastRefresh)>this.state.timerInterval){
      this.lastRefresh = currentRefreshTime
      this.clearCanvas()
      let copyOfActiveShape = Object.assign({},this.state.activeShape)
      if(this.state.activeShape.boundingBox[3] >= this.state.canvasHeight){
        this.resetBoard()
      }
      else{
        copyOfActiveShape.yPosition = copyOfActiveShape.yPosition + this.state.yIncrement
        this.setState({
          activeShape: copyOfActiveShape
        },()=>this.drawShape())
      }
    }
    else{
      requestAnimationFrame(this.computerMove)
    }
  }
  
  rotation = (direction) =>{
    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    this.clearCanvas()
    copyOfActiveShape.unitVertices = tetrisShapes.onRotate(copyOfActiveShape.unitVertices)
    copyOfActiveShape.rotationStage = copyOfActiveShape.rotationStage > 2 ? 0 : copyOfActiveShape.rotationStage + 1
    this.setState({
        activeShape: copyOfActiveShape
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
    const leftOutOfBound = left && (this.state.activeShape.boundingBox[0] - this.state.xIncrement) < 0
    const rightOutOfBound = right && (this.state.activeShape.boundingBox[1] + this.state.xIncrement) > this.state.canvasWidth
    if(leftOutOfBound || rightOutOfBound) return

    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    if(left){
      copyOfActiveShape.xPosition = copyOfActiveShape.xPosition - this.state.xIncrement
      this.clearCanvas()
      this.setState({
        activeShape: copyOfActiveShape
      },()=>this.drawShape())
    }
    else if(right){
      copyOfActiveShape.xPosition = copyOfActiveShape.xPosition + this.state.xIncrement
      this.clearCanvas()
      this.setState({
        activeShape: copyOfActiveShape
      },()=>this.drawShape())
    }
    else{
      up ? this.rotation("CCW") : this.rotation("CW")
    }
  }
  //clear canvas
  clearCanvas = ()=>{
    this.canvasContext.clearRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
  }
  
  render(){
    return(
      <div className="container">
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
