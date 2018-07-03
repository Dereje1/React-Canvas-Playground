import { tetrisShapes } from './shapes'
export const occupiedSpace = (i,j,state) =>{
    const stringCell = (i+'-'+j)
    const occupiedCellLocations = state.occupiedCells.map((c)=> c[0])
    if(occupiedCellLocations.includes(stringCell)) {
      //console.log("collision Found @",stringCell)
      if(j===0){ //gameover
        return 'done'
      }
      else{
        return runCollision(state)
      }
    }
    else{
        return false
    }
  }

export  const runCollision = (state) =>{
    

    let stringActive = state.activeCells.map((c)=>{
    return c.join('-')
    })
    //console.log(state.activeCells,state.activeShape.boundingBox,(x+'-'+y))
    const occupiedCellLocations = state.occupiedCells.map((c)=> c[0])
    //find element coordinates of active shape that are not already in the occupied cells
    stringActive = stringActive.filter((c)=>{
    return (!occupiedCellLocations.includes(c))
    })
    
    //get the colors of active shape and map with coordinates
    stringActive = stringActive.map((c)=>{
    return [c,tetrisShapes[state.activeShape.name].color]
    })
    const newOccupied = [...state.occupiedCells,...stringActive]
    const winners = winCheck(newOccupied,state)
    if(winners.length){
        return [clearRows(newOccupied,winners),winners.length]
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


  const clearRows = (occupied,winners) =>{
    const newOccupied= []
    const w= Math.min(...winners)
    occupied.forEach((c)=>{
        const occupiedY = Number(c[0].split('-')[1])
        if(w<occupiedY){
            newOccupied.push(c)
        }
        if(w>occupiedY){
            const x = Number(c[0].split('-')[0])
            const stringCoord = x + '-' + (occupiedY+winners.length)
            newOccupied.push([stringCoord,c[1]])
        }
    })
    return newOccupied
  }
