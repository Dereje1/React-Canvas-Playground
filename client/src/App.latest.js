import React, { Component } from 'react';
import './App.css';

import { tetrisShapes } from './shapes'
class App extends Component{
  constructor(props){
    super(props)
    this.state=initialState
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
    this.setState(initialState)
    if(this.downInterval)clearInterval(this.downInterval)
    this.downInterval = setInterval(()=>{
      this.computerMove()
    },this.state.timerInterval)
  }
  endTick = () =>{
    clearInterval(this.downInterval)
    //this.clearCanvas()
    console.log("Aborted!!")
  }
  clearRows = (rows) =>{
    //console.log("Winner rows found ", rows)
    let newOccupied =[]
    rows.forEach((r)=>{
      this.state.occupiedCells.forEach((o,idx)=>{
        const x = Number(o[0].split('-')[0])
        const y = Number(o[0].split('-')[1])
        const isAbove = y < r
        if(isAbove) {
          newOccupied.push([x + '-' + (y+1), ])
        }else{
          newOccupied.push(o)
        }
        //if(!isRow)newOccupied.push(o)
      })
    })
    /*
    //shift whole occupied block down
    newOccupied = newOccupied.map((c)=>{
      const x = Number(c[0].split('-')[0])
      const y = Number(c[0].split('-')[1])
      c[0] = x + '-' + (y+1)
      return c
    })
    */
    return newOccupied
  }

  winCheck = () =>{
    //get the y component of grid coordinates of the active shape
    let yCoord = this.state.activeCells.map((c)=>{
      return c[1]
    })
    //get the unique y grid coordinates
    yCoord = Array.from(new Set(yCoord))
    const occupiedCellLocations = this.state.occupiedCells.map((c)=> c[0])
   const ans=[]
    yCoord.forEach((coord)=>{
      const filterOccupied = occupiedCellLocations.filter((o)=>{
        const y = Number(o.split('-')[1])
        return coord===y
      })
      if(filterOccupied.length) ans.push(filterOccupied)
    })
    console.log(ans)
    //now add the active shape row grid coordinates to above
    const newans = []
    ans.forEach((row)=>{
      const rowNumber = Number(row[0].split('-')[1])
      const activeFilter = this.state.activeCells.filter((c)=>{
        return c[1]===rowNumber
      })
      const tostringActive = activeFilter.map((a)=>{
        return a[0] + '-' + a[1]
      })
      const potentialWinRow = [...row,...tostringActive]
      const rowSize = this.state.canvasWidth/this.state.activeShape.unitBlockSize
      if(potentialWinRow.length >= rowSize) newans.push(rowNumber)
    })
    console.log(newans)
    return newans.length ? newans : null
  }
  getSideBlock = (direction)=>{
    const cellCheck = this.state.activeCells.map((c)=>{
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
  occupiedSpace = (i,j,vertices) =>{
    const stringCell = (i+'-'+j)
    const occupiedCellLocations = this.state.occupiedCells.map((c)=> c[0])
    if(occupiedCellLocations.includes(stringCell)) {
      //console.log("collision Found @",stringCell)
      if(j===0){ //gameover
        this.endTick()
        return
      }
      else{
        this.runCollision(i,j,vertices)
      }
      
    }
  }
  screenMatrix = () => {
    const b = this.state.activeShape.unitBlockSize
    const blocksPerRow = this.state.canvasWidth / b
    let active = []
    //add origin to absolute vertices needed for check
    const absoluteVerticesWithOrigin = [...this.state.activeShape.absoluteVertices,[this.state.activeShape.xPosition,this.state.activeShape.yPosition]]

    const stringifyAbsVertices = absoluteVerticesWithOrigin.map((v)=>{
      return v.join('-')
    })
    for(let i=0;i < blocksPerRow ; i++){
      
      for(let j=0; j< blocksPerRow ; j++){
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
          //Must have all 4 vertices included to verify element is within the shape
          if (q.length === 4){
            match = true
            this.occupiedSpace(i,j,elementVertices)
            this.drawGrid(x[0],y[0],match)
          }
          else{
            continue
          }
          
          active.push([i,j])
        }
        else{
          //if unit screen element is not within bounding box then go to next row / same column
          //this.drawGrid(x[0],y[0],match)
          continue
        }
      }
    }
    this.setState({
      activeCells:active
    })
  }
  runCollision = (x,y,vertices) =>{
    const winners = this.winCheck()
    if(!winners){
      let stringOccupied = this.state.activeCells.map((c)=>{
        return c.join('-')
      })
      //console.log(this.state.activeCells,this.state.activeShape.boundingBox,(x+'-'+y))
      //find element coordinates of active shape that are not already in the occupied cells
      const occupiedCellLocations = this.state.occupiedCells.map((c)=> c[0])
      stringOccupied = stringOccupied.filter((c)=>{
        return (!occupiedCellLocations.includes(c))
      })
      
      //get the colors of active shape and map with coordinates
      stringOccupied = stringOccupied.map((c)=>{
        return [c,tetrisShapes[this.state.activeShape.name].color]
      })
      this.setState({
        occupiedCells:[...this.state.occupiedCells,...stringOccupied],
      })
    }
    else{
      //console.log(winners)
      const newOccupied = this.clearRows(winners)
      this.setState({
        occupiedCells:newOccupied,
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
    this.state.occupiedCells.forEach((cell,idx)=>{
        const x = Number(cell[0].split('-')[0])
        const y = Number(cell[0].split('-')[1])
        const col = cell[1]
        this.canvasContext.fillStyle=col;
        this.canvasContext.fillRect(x*b,y*b,b,b); 
    })
  }
  clearWinner = (row) =>{
    let result = null
    const b = this.state.canvasWidth/this.state.activeShape.unitBlockSize
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
      if (this.state.paused) return
      this.clearCanvas()
      let copyOfActiveShape = Object.assign({},this.state.activeShape)
      if(this.state.activeShape.boundingBox[3] >= this.state.canvasHeight){
        this.runCollision(3,0)
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
      if(this.state.activeShape.boundingBox[3] >= this.state.canvasHeight){
        this.runCollision()
        return
      }
      copyOfActiveShape.yPosition = copyOfActiveShape.yPosition + this.state.activeShape.unitBlockSize
      this.clearCanvas()
      this.setState({
        activeShape: copyOfActiveShape
      },()=>this.drawShape())
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
  activeCells:[],
  occupiedCells:[],
  paused:false,
  activeShape:{
    name:'shapeZ',
    unitBlockSize:40,
    xPosition:0,
    yPosition:0,
    unitVertices:[],
    absoluteVertices:[],
    boundingBox:[],
    rotationStage:0,
  }
}