import { tetrisShapes } from './shapes'
import shapeLocator from './locateShape';
export const drawGrid = (x,y,occupied,b,canvasContext) =>{
    let col = occupied ? 'grey' : 'white'
    canvasContext.beginPath();
    canvasContext.lineWidth="3";
    canvasContext.strokeStyle=col;
    canvasContext.rect(x,y,b,b); 
    canvasContext.stroke();
  }
export const drawShape = (canvasContext,updatedShape,state) =>{
    const drawResults = tetrisShapes.getDims(updatedShape)
    updatedShape.boundingBox = drawResults[0]
    updatedShape.absoluteVertices = drawResults[1]
    canvasContext.beginPath()
    canvasContext.fillStyle = tetrisShapes[updatedShape.name].color;
    canvasContext.moveTo(updatedShape.xPosition,updatedShape.yPosition)
    updatedShape.absoluteVertices.forEach((v)=>{
        canvasContext.lineTo(v[0],v[1])
    })
    canvasContext.lineTo(updatedShape.xPosition,updatedShape.yPosition)
    canvasContext.fill();
    if(!state)return
    drawRuble(canvasContext,updatedShape,state)
    return updatedShape
  }


export const drawNextShape = (canvasContext,initiailizedShape,state) =>{
    clearCanvas(canvasContext,state)
    const canvasWidth = state.canvas.canvasMinor.width
    const canvasHeight = state.canvas.canvasMinor.height

    if(initiailizedShape.name !== 'shapeI' && initiailizedShape.name !== 'shapeO'){
        initiailizedShape.xPosition = canvasWidth/2 
        initiailizedShape.yPosition = canvasHeight/2
    }
    else{
        initiailizedShape.xPosition = canvasWidth/2 + initiailizedShape.unitBlockSize/2
        initiailizedShape.yPosition = initiailizedShape.yPosition + canvasHeight/2 + initiailizedShape.unitBlockSize/2
    }
    
    
    drawShape(canvasContext,initiailizedShape)
    shapeLocator(canvasContext,canvasWidth,canvasHeight,initiailizedShape,false)
}
//clear canvas
export const clearCanvas = (canvasContext,state)=>{
    canvasContext.clearRect(0, 0, state.canvas.canvasMajor.width, state.canvas.canvasMajor.height);
}

const drawRuble = (canvasContext,activeShape,state) =>{
    const b = activeShape.unitBlockSize
    state.rubble.occupiedCells.forEach((cell)=>{
        const x = Number(cell[0].split('-')[0])
        const y = Number(cell[0].split('-')[1])
        //filled rects
        canvasContext.fillStyle=cell[1];
        canvasContext.fillRect(x*b,y*b,b,b); 
        //draw borders for rubble
        canvasContext.beginPath();
        canvasContext.lineWidth="3";
        canvasContext.strokeStyle='grey';
        canvasContext.rect(x*b,y*b,b,b); 
        canvasContext.stroke();
    })
}

export const winRubble = (canvasContext,activeShape,state,winners) =>{
    const b = activeShape.unitBlockSize
    state.rubble.occupiedCells.forEach((cell)=>{
        const x = Number(cell[0].split('-')[0])
        const y = Number(cell[0].split('-')[1])
        //filled rects
        if(!winners.includes(y)){
             //filled rects
            canvasContext.fillStyle=cell[1];
            canvasContext.fillRect(x*b,y*b,b,b); 
            //draw borders for rubble
            canvasContext.beginPath();
            canvasContext.lineWidth="3";
            canvasContext.strokeStyle='grey';
            canvasContext.rect(x*b,y*b,b,b); 
            canvasContext.stroke();
        }
    })
    const blocksPerRow = state.canvas.canvasMajor.width /b
    winners.forEach((y)=>{
        for(let x=0;x<blocksPerRow;x++){
             //filled rects
            canvasContext.fillStyle='white';
            canvasContext.fillRect(x*b,y*b,b,b); 
            //draw borders for rubble
            canvasContext.beginPath();
            canvasContext.lineWidth="3";
            canvasContext.strokeStyle='grey';
            canvasContext.rect(x*b,y*b,b,b); 
            canvasContext.stroke();
        }
    })

}