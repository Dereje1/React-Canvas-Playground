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
      activeCells:[],
      occupiedCellLocations:[],
      occupiedCellColors:[],
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
    cancelAnimationFrame(this.downInterval)
  }
  
  tick = (currentRefreshTime=0) => {
    if((currentRefreshTime-this.lastRefresh)>this.state.timerInterval){
      this.lastRefresh = currentRefreshTime
      this.computerMove()
    }
    this.downInterval = requestAnimationFrame(this.tick)
  }
  
  drawGrid = (x,y,occupied) =>{
    const b = tetrisShapes.blockSize
    let col = occupied ? 'green' : 'white'
    this.canvasContext.beginPath();
    this.canvasContext.lineWidth="3";
    this.canvasContext.strokeStyle=col;
    this.canvasContext.rect(x,y,b,b); 
    this.canvasContext.stroke();

  }
  
  screenMatrix = () => {
    //cancelAnimationFrame(this.downInterval)

    const b = tetrisShapes.blockSize
    const blocksPerRow = this.state.canvasWidth / b
    let active = []
    for(let i=0;i < blocksPerRow ; i++){
      for(let j=0; j< blocksPerRow ; j++){
        const x = [i*b,(i*b)+b]
        const y = [j*b,(j*b)+b]
        
        const xIncluded = (x[0] >= this.state.activeShape.boundingBox[0])&&(x[1] <= this.state.activeShape.boundingBox[1])
        const yIncluded = (y[0] >= this.state.activeShape.boundingBox[2])&&(y[1] <= this.state.activeShape.boundingBox[3])
        
        if(xIncluded && yIncluded){
          console.log(i+'-'+j)
          active.push([i,j])
        }
        this.drawGrid(x[0],y[0],(xIncluded && yIncluded))
      }
    }
    this.setState({
      activeCells:active
    })
  }
  runCollision = () =>{
    const stringOccupied = this.state.activeCells.map((c)=>{
      return c.join('-')
    })
    this.setState({
      occupiedCellLocations:[...this.state.occupiedCellLocations,stringOccupied],
      occupiedCellColors:[...this.state.occupiedCellColors,tetrisShapes[this.state.activeShape.name].color]
    })
    this.resetBoard()
  }

  resetBoard =(fresh=false) =>{ //clear and restart
    if(fresh) this.tick()
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
    this.drawRuble()
    this.setState({
      activeShape: copyOfActiveShape
    },()=> this.screenMatrix())
  }

  drawRuble = () =>{
    const b = tetrisShapes.blockSize
    this.state.occupiedCellLocations.forEach((blocks,idx)=>{
      blocks.forEach((cell)=>{
        const x = Number(cell.split('-')[0])
        const y = Number(cell.split('-')[1])
        const col = this.state.occupiedCellColors[idx]
        this.canvasContext.fillStyle=col;
        this.canvasContext.fillRect(x*b,y*b,b,b); 
      })
    })
  }
  //downward moevent only
  computerMove = () =>{
      this.clearCanvas()
      let copyOfActiveShape = Object.assign({},this.state.activeShape)
      if(this.state.activeShape.boundingBox[3] >= this.state.canvasHeight){
        this.runCollision()
      }
      else{
        copyOfActiveShape.yPosition = copyOfActiveShape.yPosition + this.state.yIncrement
        this.setState({
          activeShape: copyOfActiveShape
        },()=>this.drawShape())
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
