import React, { Component } from 'react';
import './App.css';

import { tetrisShapes } from './shapes'
import occupiedSpace from './collision'

class App extends Component{
  constructor(props){
    super(props)
    this.state=initialState
  }
  componentDidMount(){
    const canvas = this.refs.canvas
    canvas.focus()
    canvas.style.backgroundColor = "black";
    //setting context so it can be accesible everywhere in the class , maybe a better way ?
    this.canvasContext = canvas.getContext('2d') 
    this.lastRefresh = 0
    this.resetBoard(true)
  }

  componentWillUnmount() {
    this.endTick()
  }
  

  startTick = (speed) =>{
    if(!speed) this.setState(initialState)
    if(this.downInterval)clearInterval(this.downInterval)
    this.downInterval = setInterval(()=>{
      this.tick()
    },this.state.timerInterval)
  }
  endTick = () =>{
    clearInterval(this.downInterval)
    //this.clearCanvas()
    console.log("Aborted!!")
  }
  tick = () =>{
    if (this.state.paused) return
    if(this.state.points.linesCleared > 4 && this.state.timerInterval > 250){
      let copyOfPoints = Object.assign({},this.state.points)
      copyOfPoints.linesCleared = 0
      this.setState({
        points:copyOfPoints,
        timerInterval: this.state.timerInterval - 150
      },()=>this.startTick(true))
    }
    this.yMove()
}
  getSideBlock = (direction)=>{
    const cellCheck = this.state.activeShape.cells.map((c)=>{
      if(direction === 'L'){
        return [c[0]-1,c[1]].join('-')
      }
      else{
        return [c[0]+1,c[1]].join('-')
      }
    })
    const occupiedCellLocations = this.state.occupiedCells.map((c)=> c[0])
    const blocked = cellCheck.filter((c)=>{
      return occupiedCellLocations.includes(c)
    })
    return blocked.length ? true : false
  }
  drawGrid = (x,y,occupied) =>{
    const b = this.state.activeShape.unitBlockSize
    let col = occupied ? 'grey' : 'white'
    this.canvasContext.beginPath();
    this.canvasContext.lineWidth="3";
    this.canvasContext.strokeStyle=col;
    this.canvasContext.rect(x,y,b,b); 
    this.canvasContext.stroke();

  }

  screenMatrix = () => {
    const b = this.state.activeShape.unitBlockSize
    const blocksPerRow = this.state.canvasWidth / b
    const blocksPerColumn = this.state.canvasHeight / b
    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    let copyOfPoints = Object.assign({},this.state.points)
    copyOfActiveShape.cells =[]
    //add origin to absolute vertices needed for check
    const absoluteVerticesWithOrigin = [...this.state.activeShape.absoluteVertices,[this.state.activeShape.xPosition,this.state.activeShape.yPosition]]

    const stringifyAbsVertices = absoluteVerticesWithOrigin.map((v)=>{
      return v.join('-')
    })
    for(let i=0;i < blocksPerRow ; i++){
      
      for(let j=0; j< blocksPerColumn ; j++){
        //check if current unit screen element is within bounding box of active shape
        const x = [i*b,(i*b)+b]
        const y = [j*b,(j*b)+b]
        
        const xIncluded = (x[0] >= this.state.activeShape.boundingBox[0])&&(x[1] <= this.state.activeShape.boundingBox[1])
        const yIncluded = (y[0] >= this.state.activeShape.boundingBox[2])&&(y[1] <= this.state.activeShape.boundingBox[3])
        
        let match = false
        if(xIncluded && yIncluded){
          //it is within bounding box
          //find true vertices of unit element
          const elementVertices = [[i*b,j*b],[i*b,(j*b)+b],[(i*b)+b,(j*b)+b],[(i*b)+b,j*b]]
          const stringElementVertices = elementVertices.map((v)=>{
            return v.join('-')
          })
          //how many of the element vertices are included in the absolute vertices ??
          const q = stringElementVertices.filter((v)=>{
            return stringifyAbsVertices.includes(v)
          })
          //Must have all 4 vertices included to verify element is within the shape , other wise just go to
          //the next cell down in the same column
          if (q.length === 4){
            match = true
            const isOccupied = occupiedSpace(i,j,this.state)
            if(isOccupied){
              if(isOccupied==='done'){
                this.endTick()
                return
              }
              const incrementLines = isOccupied[1] ? isOccupied[1] : 0
              copyOfPoints.linesCleared = this.state.points.linesCleared + incrementLines
              copyOfPoints.totalLinesCleared = incrementLines!==0 ? this.state.points.totalLinesCleared + incrementLines : this.state.points.totalLinesCleared
              this.setState({
                occupiedCells:isOccupied[0],
                points: copyOfPoints
              },()=>this.resetBoard())
              return
            } 
            this.drawGrid(x[0],y[0],match)
            copyOfActiveShape.cells.push([i,j])
          }      
        }
      }
    }
    this.setState({
      activeShape: copyOfActiveShape
    })
  }


  resetBoard =(fresh=false) =>{ //clear and restart
    if(fresh) {
      this.refs.canvas.focus()
      this.startTick()
    }
     //clear timer
    this.clearCanvas() //clear canvas
    const randomShape = this.getRandomShape()
    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    //I and O shapes need right offset
    if(randomShape[0] !== 'shapeI' && randomShape[0] !== 'shapeO'){
      copyOfActiveShape.xPosition = (this.state.canvasWidth/2) + this.state.activeShape.unitBlockSize/2
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
    const x = (pickedShape !== 'shapeI' && pickedShape !== 'shapeO') ? this.state.canvasWidth/2 + this.state.activeShape.unitBlockSize/2 : this.state.canvasWidth/2
    const initialScaledVertices = tetrisShapes.getAbsoluteVertices(this.state.activeShape.unitBlockSize,x,0,tetrisShapes[pickedShape].vertices)
    
    const initialBoundingBox = tetrisShapes.onBoundingBox(initialScaledVertices)
    
    return [pickedShape,initialBoundingBox[2]]
  }
  drawShape = (fresh = false) =>{
    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    const drawResults = tetrisShapes.onDraw(this.canvasContext,this.state.activeShape)
    copyOfActiveShape.boundingBox = drawResults[0]
    copyOfActiveShape.absoluteVertices = drawResults[1]
    this.drawRuble()
    this.setState({
      activeShape: copyOfActiveShape
    },()=> this.screenMatrix())
  }

  drawRuble = () =>{
    
    const b = this.state.activeShape.unitBlockSize
    this.state.occupiedCells.forEach((cell)=>{
        const x = Number(cell[0].split('-')[0])
        const y = Number(cell[0].split('-')[1])
        //filled rects
        this.canvasContext.fillStyle=cell[1];
        this.canvasContext.fillRect(x*b,y*b,b,b); 
        //draw borders for rubble
        this.canvasContext.beginPath();
        this.canvasContext.lineWidth="3";
        this.canvasContext.strokeStyle='grey';
        this.canvasContext.rect(x*b,y*b,b,b); 
        this.canvasContext.stroke();
    })
  }

  //downward moevent only
  screenBottom = () =>{
    const collisionResult = occupiedSpace(null,this.state.canvasHeight/this.state.activeShape.unitBlockSize,this.state)
    let copyOfPoints = Object.assign({},this.state.points)
    const incrementLines = collisionResult[1] ? collisionResult[1] : 0
    copyOfPoints.linesCleared = this.state.points.linesCleared + incrementLines
    copyOfPoints.totalLinesCleared = incrementLines!==0 ? this.state.points.totalLinesCleared + incrementLines : this.state.points.totalLinesCleared
    this.setState({
      occupiedCells:collisionResult[0],
      points: copyOfPoints,
    },()=>this.resetBoard())
  }
  yMove = () =>{
    this.clearCanvas()
    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    if(this.state.activeShape.boundingBox[3] >= this.state.canvasHeight){//bottom of screen
      this.screenBottom()
    }
    else{
      copyOfActiveShape.yPosition = copyOfActiveShape.yPosition + this.state.activeShape.unitBlockSize
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
    //if(this.state.paused)return
    const left = e.keyCode===37
    const right = e.keyCode===39
    const up = e.keyCode===38
    const down = e.keyCode===40
    
    
    if(!(left||right||up||down)) return //do nothing for any other keypress
  
    //check X boundaries 
    const leftOutOfBound = left && (this.state.activeShape.boundingBox[0] - this.state.activeShape.unitBlockSize) < 0
    const rightOutOfBound = right && (this.state.activeShape.boundingBox[1] + this.state.activeShape.unitBlockSize) > this.state.canvasWidth
    if(leftOutOfBound || rightOutOfBound) return

    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    if(left){
      if(this.getSideBlock('L'))return
      copyOfActiveShape.xPosition = copyOfActiveShape.xPosition - this.state.activeShape.unitBlockSize
      this.clearCanvas()
      this.setState({
        activeShape: copyOfActiveShape
      },()=>this.drawShape())
    }
    else if(right){
      if(this.getSideBlock('R'))return
      copyOfActiveShape.xPosition = copyOfActiveShape.xPosition + this.state.activeShape.unitBlockSize
      this.clearCanvas()
      this.setState({
        activeShape: copyOfActiveShape
      },()=>this.drawShape())
    }
    else if(down){
      this.yMove()
    }
    else{
      this.rotation()
    }
  }
  //clear canvas
  clearCanvas = ()=>{
    this.canvasContext.clearRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
  }
  handlePause = () =>{
    this.refs.canvas.focus()
    this.setState({
      paused: this.state.paused ? false :true
    })
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
      <div className ='controls'>
        <button className="reset" onClick={()=>this.resetBoard(true)}>
          Reset
        </button>
        <label htmlFor="test">Lines Cleared = {this.state.points.totalLinesCleared}</label>
        <label>
          Pause:
          <input
            name="isGoing"
            type="checkbox"
            checked={this.state.paused}
            onChange={this.handlePause} />
        </label>
       </div>
      </div>
    )
  }
}

export default App;

const initialState={ //determine what needs to go into state, a very small portion here
  canvasWidth:640,
  canvasHeight:640,
  timerInterval:700,
  occupiedCells:[],
  paused:false,
  points:{
    linesCleared:0,
    totalLinesCleared:0
  },
  activeShape:{
    name:'shapeZ',
    unitBlockSize:40,
    xPosition:0,
    yPosition:0,
    unitVertices:[],
    absoluteVertices:[],
    boundingBox:[],
    rotationStage:0,
    cells:[],
  }
}