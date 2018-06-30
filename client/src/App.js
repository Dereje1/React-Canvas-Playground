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
      run: true,
      activeShape:{
        name:'shapeZ',
        xPosition:0,
        yPosition:0,
        unitVertices:[],
        absoluteVertices:[],
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
    this.endTick()
  }
  
  startTick = () =>{
    if(!this.downInterval){
      this.downInterval = requestAnimationFrame(this.tick)
    }
  }
  endTick = () =>{
    window.cancelAnimationFrame(this.downInterval)
    console.log("Aborted!!")
  }
  tick = (currentRefreshTime=0) => {
    //console.log(this.downInterval)
    if((currentRefreshTime-this.lastRefresh)>this.state.timerInterval){
      this.lastRefresh = currentRefreshTime
       this.computerMove()
    }
    if(this.state.run) {
      requestAnimationFrame(this.tick)
    }
    else{
      this.endTick()
    }
    //
  }
  
  drawGrid = (x,y,occupied) =>{
    const b = tetrisShapes.blockSize
    let col = occupied ? 'grey' : 'green'
    this.canvasContext.beginPath();
    this.canvasContext.lineWidth="3";
    this.canvasContext.strokeStyle=col;
    this.canvasContext.rect(x,y,b,b); 
    this.canvasContext.stroke();

  }
  
  screenMatrix = () => {

    const b = tetrisShapes.blockSize
    const blocksPerRow = this.state.canvasWidth / b
    let active = []
    const absoluteVerticesWithOrigin = [...this.state.activeShape.absoluteVertices,[this.state.activeShape.xPosition,this.state.activeShape.yPosition]]

    const stringifyAbsVertices = absoluteVerticesWithOrigin.map((v)=>{
      return v.join('-')
    })
    for(let i=0;i < blocksPerRow ; i++){
      
      for(let j=0; j< blocksPerRow ; j++){
        const x = [i*b,(i*b)+b]
        const y = [j*b,(j*b)+b]
        
        const xIncluded = (x[0] >= this.state.activeShape.boundingBox[0])&&(x[1] <= this.state.activeShape.boundingBox[1])
        const yIncluded = (y[0] >= this.state.activeShape.boundingBox[2])&&(y[1] <= this.state.activeShape.boundingBox[3])
        
        let match = false
        if(xIncluded && yIncluded){
          const elementVertices = [[i*b,j*b],[i*b,(j*b)+b],[(i*b)+b,(j*b)+b],[(i*b)+b,j*b]]
          const stringElementVertices = elementVertices.map((v)=>{
            return v.join('-')
          })
          const q = stringElementVertices.filter((v)=>{
            return stringifyAbsVertices.includes(v)
          })

          if (q.length === 4){
            match = true
          }
          else{
            continue
          }
          const stringCell = (i+'-'+j)
          if(this.state.occupiedCellLocations.includes(stringCell)) {
            console.log("collision Found @",stringCell)
            if(j===0){
              this.setState({
                run: false
              },()=>this.clearCanvas())
            }
            else{
              this.runCollision(i,j)
            }
            
          }
          active.push([i,j])
        }
        else{
          continue
        }
        this.drawGrid(x[0],y[0],match)
      }
    }
    this.setState({
      activeCells:active
    })
  }
  runCollision = (x,y) =>{
    
    let stringOccupied = this.state.activeCells.map((c)=>{
      return c.join('-')
    })
    stringOccupied = stringOccupied.filter((c)=>{
      return (!this.state.occupiedCellLocations.includes(c))
    })
    const colors = stringOccupied.map((c)=>{
      return tetrisShapes[this.state.activeShape.name].color
    })
    const results = this.clearWinner(x,y)
    if(results){
      this.setState({
        occupiedCellLocations:[...results[0],...stringOccupied],
        occupiedCellColors:[...results[1],...colors]
      })
    }
    else{
      this.setState({
        occupiedCellLocations:[...this.state.occupiedCellLocations,...stringOccupied],
        occupiedCellColors:[...this.state.occupiedCellColors,...colors]
      })
    }

    this.resetBoard()
  }

  resetBoard =(fresh=false) =>{ //clear and restart
    if(fresh) this.startTick()
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
    const x = (pickedShape !== 'shapeI' && pickedShape !== 'shapeO') ? this.state.canvasWidth/2 + 20 : this.state.canvasWidth/2
    const initialScaledVertices = tetrisShapes.getAbsoluteVertices(x,0,tetrisShapes[pickedShape].vertices)
    
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
    
    const b = tetrisShapes.blockSize
    this.state.occupiedCellLocations.forEach((cell,idx)=>{
        const x = Number(cell.split('-')[0])
        const y = Number(cell.split('-')[1])
        const col = this.state.occupiedCellColors[idx]
        this.canvasContext.fillStyle=col;
        this.canvasContext.fillRect(x*b,y*b,b,b); 
    })
  }
  clearWinner = (column,row) =>{
    let result = null
    const b = this.state.canvasWidth/tetrisShapes.blockSize
    const potential = this.state.occupiedCellLocations.filter((cell)=>{
        const y = Number(cell.split('-')[1])
        return y===row
    })
    if(b===potential.length){
      console.log(`Winner Found on row ${row}`)
      //let copyOfCells = [...state.occupiedCellLocations]
      let newOccupiedCells = this.state.occupiedCellLocations.reduce((prev,curr)=>{
        const x = Number(curr.split('-')[0])
        const y = Number(curr.split('-')[1])
        if (y!==row){
          return [...prev,curr]
        }
        else{
          return prev
        }
      },[])
      const newOccupiedColors = this.state.occupiedCellColors.reduce((prev,curr)=>{
        const x = Number(curr.split('-')[0])
        const y = Number(curr.split('-')[1])
        if (y!==row){
          return [...prev,curr]
        }
        else{
          return prev
        }
      },[])
      newOccupiedCells = newOccupiedCells.map((cell)=>{
        const x = Number(cell.split('-')[0])
        let y = Number(cell.split('-')[1])
        y = y+1
        const newPos = x + '-' + y
        return newPos
      })
      result = [newOccupiedCells,newOccupiedColors]
    }
    return result
  }
  //downward moevent only
  computerMove = () =>{
      //console.log(this.state.activeShape.boundingBox[2])
      this.clearCanvas()
      let copyOfActiveShape = Object.assign({},this.state.activeShape)
      if(this.state.activeShape.boundingBox[3] >= this.state.canvasHeight){
        this.runCollision()
      }
      else if(this.state.activeShape.boundingBox[2]<0){
        this.setState({
          run:false
        })
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
