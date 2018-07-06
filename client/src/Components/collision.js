import { tetrisShapes } from './shapes'
const occupiedSpace = (i,j,state) =>{
    const stringCell = (i+'-'+j)
    const occupiedCellLocations = state.rubble.occupiedCells.map((c)=> c[0])
    //checks if at bottom of screen
    const columnElementSize = state.canvasHeight/state.activeShape.unitBlockSize
    if(occupiedCellLocations.includes(stringCell) || (columnElementSize===j)) {
      //console.log("collision Found @",stringCell)\
      return j===0 ? 'done' : runCollision(state)
    }
    else{
        return false
    }
  }

const runCollision = (state) =>{
    let stringActive = state.activeShape.cells.map(c=> c.join('-'))
 
    const occupiedCellLocations = state.rubble.occupiedCells.map(c=> c[0])

    //find element coordinates of active shape that are not already in the occupied cells
    stringActive = stringActive.filter(c=> (!occupiedCellLocations.includes(c)))
    
    //get the colors of active shape and store with the coordinates
    stringActive = stringActive.map(c=> [c,tetrisShapes[state.activeShape.name].color])
    //add the new cells to the occupied ones
    const newOccupied = [...state.rubble.occupiedCells,...stringActive]
    const winners = winCheck(newOccupied,state)
    if(winners.length){
        return [clearRows(newOccupied,winners,state.canvasHeight/state.activeShape.unitBlockSize),winners]
    }
    else{
        return [newOccupied,null]
    }
  }

 const winCheck = (newOccupied,state) =>{
    //get a Ycoordinate array from occupied cells
    const yCoord = newOccupied.map((c)=> Number(c[0].split('-')[1]))
    //find unique y coordinates
    const yUnique = Array.from(new Set(yCoord))

    const rowSize = state.canvasWidth/state.activeShape.unitBlockSize
    const winners =[]
    yUnique.forEach((u)=>{
        let counter=0
        yCoord.forEach((c)=>{
            if(c===u)counter++
        })
        if(counter===rowSize) winners.push(u)
    })
    return winners
  }
const clearRows = (occupied,winners,columnLength) =>{
    const newOccupied= []
    const w= Math.max(...winners)
    occupied.forEach((c)=>{
        const occupiedY = Number(c[0].split('-')[1])
        if(!winners.includes(occupiedY)){
            if(occupiedY>w){
                newOccupied.push(c)
            }
            else{
                const x = Number(c[0].split('-')[0])
                //const overFlow = (occupiedY + winners.length) > columnLength
                //console.log(overFlow,columnLength)
                const stringCoord = x + '-' + (occupiedY + winners.length)
                newOccupied.push([stringCoord,c[1]])
            }
        }
    })
    return newOccupied
}

export default occupiedSpace