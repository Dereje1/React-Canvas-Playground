import { tetrisShapes } from './shapes'

const runCollision = (state,shapeTested) =>{
    const occupiedCellLocations = state.rubble.occupiedCells.map(c=> c[0])
    //shape to test for collison
    const testedShape = shapeTested.cells.map(c=> c.join('-'))
    //currently active shape
    let preCollisionShape = state.activeShape.cells.map(c=> c.join('-'))
    //game play area occupied cells
    const isOccupied = testedShape.filter(c=> (occupiedCellLocations.includes(c)))
    //bottom boundary occupied cells
    const isLowerBoundary = testedShape.filter(c=> (state.rubble.boundaryCells.includes(c)))
    //upperBoundary ocupied cells
    const isUpperBoundary = shapeTested.cells.filter(c => c[1] === 0 )
    if(isOccupied.length || isLowerBoundary.length){//collision detected
        if(isUpperBoundary.length) return 'done'
        //add color info to active shape
        preCollisionShape = preCollisionShape.map(c=> [c,tetrisShapes[state.activeShape.name].color])
        //add active shaped to occupied cells
        const newOccupied = [...state.rubble.occupiedCells,...preCollisionShape]
        //test for winner
        const winners = winCheck(newOccupied,state)
        if(winners.length){
            return [clearRows(newOccupied,winners,state.canvasHeight/state.activeShape.unitBlockSize),winners]
        }
        else{
            return [newOccupied,null]
        }
    }
    else return false //no collision detected

  }

 const winCheck = (newOccupied,state) =>{
    //get a Ycoordinate array from occupied cells
    const yCoord = newOccupied.map((c)=> Number(c[0].split('-')[1]))
    //find unique y coordinates
    const yUnique = Array.from(new Set(yCoord))
    //find how amny elements per row
    const rowSize = state.canvasWidth/state.activeShape.unitBlockSize
    const winners =[]
    //test if new state would have a winnable row by comparing occupation with row size
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
    const w= Math.max(...winners) //gets maximum (bottom most) winning row
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

export default runCollision