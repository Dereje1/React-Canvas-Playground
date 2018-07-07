import React, { Component } from 'react';
import './App.css';

import { tetrisShapes } from './shapes'
import occupiedSpace from './collision'
import {clearCanvas,drawShape,drawGrid,winRubble} from './canvas'

class App extends Component{
  constructor(props){
    super(props)
    this.state=initialState
  }
  componentDidMount(){
    this.resetBoard()
  }

  componentWillUnmount() {
    this.endTick('componentWillUnmount')
  }
  
  resetBoard =() =>{ //clear and restart
    const canvas = this.refs.canvas
    canvas.focus()
    canvas.style.backgroundColor = "black";
    //setting context so it can be accesible everywhere in the class , maybe a better way ?
    this.canvasContext = canvas.getContext('2d') 
    if(this.downInterval) this.endTick('reset Board')
    this.setState(initialState,()=>this.startTick())
    
  }
newShape = ()=>{
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

  this.updateScreen(copyOfActiveShape)
}
  startTick = () =>{
    this.abortCounter = 0
    if(this.downInterval)clearInterval(this.downInterval)
    this.newShape()
    this.downInterval = setInterval(()=>{
      this.tick()
    },this.state.timerInterval)
  }
  endTick = (c) =>{
    this.abortCounter++
    console.log(`Called by ${c} , attempts = ${this.abortCounter}`)
    clearInterval(this.downInterval)
    this.setState({
      paused:true
    })
  }
  tick = () =>{
    //console.log(this.downInterval)
    if (this.state.paused) return
    //handle y direction movements
    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    if(this.state.activeShape.boundingBox[3] >= this.state.canvasHeight){//bottom of screen
      this.collisionCheck(null,this.state.canvasHeight/this.state.activeShape.unitBlockSize)
    }
    else{
      copyOfActiveShape.yPosition = copyOfActiveShape.yPosition + this.state.activeShape.unitBlockSize
      this.updateScreen(copyOfActiveShape)
    }
}

updateScreen = (updatedShape) =>{
  clearCanvas(this.canvasContext,this.state) //clear canvas
  const drawReturn = drawShape(this.canvasContext,updatedShape,this.state)
  let copyOfRubble = Object.assign({},this.state.rubble)
  copyOfRubble.winRows = null
  this.setState({
    activeShape: drawReturn,
    rubble:copyOfRubble,
    paused:false
  },()=>this.screenMatrix())
}

  screenMatrix = () => {
    const b = this.state.activeShape.unitBlockSize
    const blocksPerRow = this.state.canvasWidth / b
    const blocksPerColumn = this.state.canvasHeight / b
    let copyOfActiveShape = Object.assign({},this.state.activeShape)

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
            drawGrid(x[0],y[0],match,b,this.canvasContext)
            copyOfActiveShape.cells.push([i,j])
            if(this.collisionCheck(i,j)==='done')return
          }      
        }
      }
    }
    this.setState({
      activeShape: copyOfActiveShape
    })
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

  collisionCheck = (i,j) =>{
    let copyOfPoints = Object.assign({},this.state.points)
    let copyOfRubble = Object.assign({},this.state.rubble)
    const collisionResult = occupiedSpace(i,j,this.state)

    if(collisionResult){
      if(collisionResult==='done'){
        this.endTick('collision check - game done')
        return 'done'
      }
      const rowsCleared = collisionResult[1] ? collisionResult[1].length : 0
      const reduceTimeinterval = ((this.state.points.linesCleared + rowsCleared) > this.state.points.levelUp && this.state.timerInterval > 250) ? true : false

      copyOfPoints.linesCleared = reduceTimeinterval ? 0 : this.state.points.linesCleared + rowsCleared
      copyOfPoints.totalLinesCleared = rowsCleared ? this.state.points.totalLinesCleared  + rowsCleared: this.state.points.totalLinesCleared

      copyOfRubble.occupiedCells = collisionResult[0]
      copyOfRubble.winRows = collisionResult[1]
      if(rowsCleared){
        this.endTick('collision check - winning row')
        console.log('reduce Interval, ', reduceTimeinterval )
        clearCanvas(this.canvasContext,this.state) //clear canvas
        winRubble(this.canvasContext,this.state.activeShape,this.state,collisionResult[1])
        const inter = setTimeout(() => {
          this.setState({
            rubble:copyOfRubble,
            points: copyOfPoints,
            timerInterval: reduceTimeinterval ? this.state.timerInterval - 150 : this.state.timerInterval
            },()=>this.startTick())
            clearInterval(inter)
        }, 250);
      }
      else{
        this.setState({
        rubble:copyOfRubble,
        points: copyOfPoints,
        },()=>this.newShape())
      }
    }
  }
handlePause = () =>{
  this.refs.canvas.focus()
  this.setState({
    paused: this.state.paused ? false :true
  })
}
/*handle all player movements below*/
playerMoves = (e)=>{
    if(this.state.paused)return
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
      this.updateScreen(copyOfActiveShape)
    }
    else if(right){
      if(this.getSideBlock('R'))return
      copyOfActiveShape.xPosition = copyOfActiveShape.xPosition + this.state.activeShape.unitBlockSize
      this.updateScreen(copyOfActiveShape)
    }
    else if(down) this.tick()
    else this.rotation()
  }

rotation = () =>{
    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    copyOfActiveShape.unitVertices = tetrisShapes.onRotate(copyOfActiveShape.unitVertices)
    copyOfActiveShape.rotationStage = copyOfActiveShape.rotationStage > 2 ? 0 : copyOfActiveShape.rotationStage + 1
    const boundingBox = tetrisShapes.onBoundingBox(tetrisShapes.getAbsoluteVertices(this.state.activeShape.unitBlockSize,this.state.activeShape.xPosition,this.state.activeShape.yPosition,copyOfActiveShape.unitVertices))

    if(boundingBox[0]<0 || boundingBox[1]>this.state.canvasWidth){
      return
    }
    this.updateScreen(copyOfActiveShape)
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
  const occupiedCellLocations = this.state.rubble.occupiedCells.map((c)=> c[0])
  const blocked = cellCheck.filter((c)=>{
    return occupiedCellLocations.includes(c)
  })
  return blocked.length ? true : false
}


  render(){
    return(
      <div className="container">
      <canvas 
        ref="canvas" 
        width={this.state.canvasWidth} 
        height={this.state.canvasHeight} 
        tabIndex="0"
        onKeyDown={(e)=>this.playerMoves(e)}
        />
      <div className ='controls'>
        <button className="reset" onClick={()=>this.resetBoard()}>
          Reset
        </button>
        <label htmlFor="test">Lines Cleared = {this.state.points.totalLinesCleared}</label>
        <label htmlFor="test">Level = {Math.floor(this.state.points.totalLinesCleared/(this.state.points.levelUp+1))}</label>
        <label>
          Pause:
          <input
            name="Pausing"
            type="checkbox"
            onChange={this.handlePause} />
        </label>
       </div>
      </div>
    )
  }
}

const initialState={ //determine what needs to go into state, a very small portion here
  canvasWidth:640,
  canvasHeight:640,
  timerInterval:700,
  paused:false,
  points:{
    linesCleared:0,
    totalLinesCleared:0,
    levelUp:4
  },
  rubble:{
    occupiedCells:[],
    winRows:null
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

export default App;