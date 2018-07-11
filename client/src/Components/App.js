import React, { Component } from 'react';
import './App.css';

import { tetrisShapes } from './shapes'
import shapeLocator from './locateShape'
import runCollision from './collision'
import {clearCanvas,drawShape,winRubble, drawNextShape} from './canvas'

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
    const canvasMajor = this.refs.canvasMajor
    const canvasMinor = this.refs.canvasMinor
    canvasMajor.focus()
    canvasMajor.style.backgroundColor = "black";
    canvasMinor.style.backgroundColor = "black";
    //setting context so it can be accesible everywhere in the class , maybe a better way ?
    this.canvasContextMajor = canvasMajor.getContext('2d') 
    this.canvasContextMinor = canvasMinor.getContext('2d') 
    if(this.downInterval) this.endTick('reset Board')
    //set bottom boundary by occupying cells
    if(!initialState.rubble.boundaryCells.length){
      const b = this.state.activeShape.unitBlockSize
      const blocksPerRow = this.state.canvasWidth / b
      const blocksPerColumn = this.state.canvasHeight / b
      for(let i=0; i< blocksPerRow;i++){
        initialState.rubble.boundaryCells.push(i+'-'+blocksPerColumn)
      }
    }
    this.setState(initialState,()=>this.startTick())
  }
  newShape = ()=>{
    const randomShape = this.state.nextShape ? this.initializeShape(this.state.nextShape) : this.initializeShape(this.getRandShapeName())
    const nextShape = this.getRandShapeName()
    const nextShapeInfo = this.initializeShape(nextShape)
    
    this.setState({
      nextShape: nextShape
    },()=>drawNextShape(this.canvasContextMinor,nextShapeInfo,this.state))

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
    if (this.state.paused) return
    //handle y direction movements
    let copyOfActiveShape = Object.assign({},this.state.activeShape)
    //console.log(`bbox @ tick ${this.state.activeShape.boundingBox}`)
    copyOfActiveShape.yPosition = copyOfActiveShape.yPosition + this.state.activeShape.unitBlockSize
    this.updateScreen(copyOfActiveShape)
  }

  updateScreen = (updatedShape) =>{
    clearCanvas(this.canvasContextMajor,this.state) //clear canvasMajor
    const drawReturn = drawShape(this.canvasContextMajor,updatedShape,this.state)
    let copyOfRubble = Object.assign({},this.state.rubble)
    copyOfRubble.winRows = null //need to reset back to null incase of previous win
    this.setState({
      activeShape: drawReturn,
      rubble:copyOfRubble,
      paused:false,
    },()=>this.screenMatrix())
  }

  screenMatrix = () => {//sweep playable area
    const locatedShape = shapeLocator(this.canvasContextMajor,this.state.canvasWidth,this.state.canvasHeight,this.state.activeShape)
    const testCollision = this.collisionCheck(locatedShape)
    //if no collison store cell coordinates in state for future comparison
    if(!testCollision){
      this.setState({
        activeShape: locatedShape
      })
    }
  }

  getRandShapeName = () =>{
    const shapeList = ['shapeL','shapeZ','shapeT','shapeI','shapeJ','shapeO','shapeS']
    const randNum = Math.floor(Math.random() * (shapeList.length));
    return shapeList[randNum]
  }
  initializeShape = (shapeName) =>{
    
    //finding intital y bound so it does not get cutoff 
    const pickedShape = shapeName
    const x = (pickedShape !== 'shapeI' && pickedShape !== 'shapeO') ? this.state.canvasWidth/2 + this.state.activeShape.unitBlockSize/2 : this.state.canvasWidth/2
    const initialScaledVertices = tetrisShapes.getAbsoluteVertices(this.state.activeShape.unitBlockSize,x,0,tetrisShapes[pickedShape].vertices)
    
    const initialBoundingBox = tetrisShapes.onBoundingBox(initialScaledVertices)
    
    return [pickedShape,initialBoundingBox[2]]
  }

  collisionCheck = (testShape) =>{
    let copyOfPoints = Object.assign({},this.state.points)
    let copyOfRubble = Object.assign({},this.state.rubble)
    const collisionResult = runCollision(this.state,testShape)

    if(collisionResult){//found collision
      //check if game space is all occupied
      if(collisionResult==='done'){
        this.endTick('collision check - game done')
        return 'done'
      }
      //retreive total rows cleared (if any) and test for time interval reduction
      const rowsCleared = collisionResult[1] ? collisionResult[1].length : 0
      const reduceTimeinterval = (((this.state.points.totalLinesCleared  + rowsCleared)% this.state.points.levelUp) ===0  && this.state.timerInterval > 250) ? true : false
      //assign points if winner found
      copyOfPoints.totalLinesCleared = this.state.points.totalLinesCleared  + rowsCleared
      //assign new rubble coordinates
      copyOfRubble.occupiedCells = collisionResult[0]
      copyOfRubble.winRows = collisionResult[1]
      if(rowsCleared){//winner found
        //end tick to play animation and start tick back after animation is over
        this.endTick('collision check - winning row')
        console.log('reduce Interval, ', reduceTimeinterval )
        clearCanvas(this.canvasContextMajor,this.state) //clear canvasMajor
        winRubble(this.canvasContextMajor,this.state.activeShape,this.state,collisionResult[1])
        const inter = setTimeout(() => {
          this.setState({
            rubble:copyOfRubble,
            points: copyOfPoints,
            timerInterval: reduceTimeinterval ? this.state.timerInterval - 150 : this.state.timerInterval
            },()=>this.startTick())
            clearInterval(inter)
        }, 250);
      }
      else{//no winner found just set state with current rubble
        this.setState({
        rubble:copyOfRubble,
        points: copyOfPoints,
        },()=>this.newShape())
      }
    }
    else{
      return false
    }
  }
  handlePause = () =>{
    this.refs.canvasMajor.focus()
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
      else this.rotation(this.state.activeShape)
    }

  rotation = (active) =>{
      const unitVerticesAfterRotation = tetrisShapes.onRotate(active.unitVertices)
      const boundingBox = tetrisShapes.onBoundingBox(tetrisShapes.getAbsoluteVertices(this.state.activeShape.unitBlockSize,this.state.activeShape.xPosition,this.state.activeShape.yPosition,unitVerticesAfterRotation))

      let copyOfActiveShape = Object.assign({},this.state.activeShape)
      copyOfActiveShape.unitVertices = unitVerticesAfterRotation
      copyOfActiveShape.rotationStage = copyOfActiveShape.rotationStage > 2 ? 0 : copyOfActiveShape.rotationStage + 1

      //crude wall kicks, ideally should translate with a recursive function
      if(boundingBox[0]<0 || boundingBox[1]>this.state.canvasWidth){ //side wall kicks
        const translateUnits = this.state.activeShape.name === 'shapeI' ? 2 : 1
        if(boundingBox[0]<0){//translate to the left 
          copyOfActiveShape.xPosition = copyOfActiveShape.xPosition + (translateUnits*this.state.activeShape.unitBlockSize)
        }
        else{//translate to the right
          copyOfActiveShape.xPosition = copyOfActiveShape.xPosition - (translateUnits*this.state.activeShape.unitBlockSize)
        }
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
        <div className ='controls'>
        <canvas
        ref="canvasMinor" 
        width={this.state.canvasWidth/2} 
        height={this.state.canvasHeight/4} 
        tabIndex="0"
        />
          <button className="reset" onClick={()=>this.resetBoard()}>
            Reset
          </button>
          <label htmlFor="test">Lines Cleared = {this.state.points.totalLinesCleared}</label>
          <label htmlFor="test">Level = {Math.floor(this.state.points.totalLinesCleared/(this.state.points.levelUp))}</label>
          <label>
            Pause:
            <input
              name="Pausing"
              type="checkbox"
              value={this.state.paused}
              onChange={this.handlePause} />
          </label>
        </div>
        <canvas 
        ref="canvasMajor" 
        width={this.state.canvasWidth} 
        height={this.state.canvasHeight} 
        tabIndex="0"
        onKeyDown={(e)=>this.playerMoves(e)}
        />
      </div>
    )
  }
}

const initialState={ //determine what needs to go into state, a very small portion here
  canvasWidth:300,
  canvasHeight:600,
  timerInterval:700,
  paused:false,
  nextShape:'',
  points:{
    totalLinesCleared:0,
    levelUp:5
  },
  rubble:{// all screen info of rubble
    occupiedCells:[],
    winRows:null,
    boundaryCells:[]
  },
  activeShape:{//all geometric info of active shape
    name:'shapeZ',
    unitBlockSize:30,
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