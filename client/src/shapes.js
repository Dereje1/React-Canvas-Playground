export const tetrisShapes = {
    onDraw: (canvasContext,activeShape)=>{
        const blockSize = activeShape.unitBlockSize
        const absoluteVertices = tetrisShapes.getAbsoluteVertices(blockSize,activeShape.xPosition,activeShape.yPosition,activeShape.unitVertices)
        canvasContext.beginPath()
        canvasContext.fillStyle = tetrisShapes[activeShape.name].color;
        canvasContext.moveTo(activeShape.xPosition,activeShape.yPosition)
        absoluteVertices.forEach((v)=>{
            canvasContext.lineTo(v[0],v[1])
        })
        canvasContext.lineTo(activeShape.xPosition,activeShape.yPosition)
        canvasContext.fill();
        return [tetrisShapes.onBoundingBox(absoluteVertices),absoluteVertices]
    },
    onRotate: (oldVertices)=>{
        /*
        Trig coordinate transformation formula
        x′=(x−p)cos(θ)−(y−q)sin(θ)+p,
        y′=(x−p)sin(θ)+(y−q)cos(θ)+q.
        where (p,q) point of rotation, and (x,y) are the pre-transformed points
        https://math.stackexchange.com/questions/270194/how-to-find-the-vertices-angle-after-rotation
        
        can reduce above formula since θ will always = 90 , so,
        x′= q - y + p
        y′= x − p + q
        and since canvas will start drawing at origin = point of rotation, (p,q) = (0,0)
        x′= -y 
        y′= x
        */
        const newVertices = oldVertices.map((v)=>{
            const xPrime = -v[1] 
            const yPrime = v[0]
            return [xPrime,yPrime]
        })
        return newVertices
    },
    onBoundingBox: (absoluteVertices)=> {
        const xArr = absoluteVertices.map((v)=>{
            return v[0]
        })
        const yArr = absoluteVertices.map((v)=>{
            return v[1]
        })
        return [Math.min(...xArr),Math.max(...xArr),Math.min(...yArr),Math.max(...yArr)]
    },
    getAbsoluteVertices: (blockSize,x,y,unitVertices)=>{
        return unitVertices.map((v)=>{
            return [x+(v[0]*blockSize),y+(v[1]*blockSize)]
        }) 
    },
    shapeI:{
        //[[-2,0],[-2,-1],[2,-1],[2,0]]
        vertices:[[-1,0],[-2,0],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[2,0],[1,0]],
        color: 'cyan'
    },
    shapeJ:{
        //[[0,-.5],[1.5,-.5],[1.5,.5],[-1.5,0.5],[-1.5,-1.5],[-.5,-1.5],[-.5,-.5],[0,-.5]]
        vertices:[[-.5,.5],[-1.5,.5],[-1.5,-.5],[-1.5,-1.5],[-.5,-1.5],[-.5,-.5],[0.5,-.5],[1.5,-.5],[1.5,.5],[.5,.5],[-.5,.5]],
        color: 'blue'
    },
    shapeL:{
        //[[0,-.5],[-1.5,-.5],[-1.5,.5],[1.5,0.5],[1.5,-1.5],[.5,-1.5],[.5,-.5],[0,-.5]]
        vertices:[[.5,.5],[1.5,.5],[1.5,-.5],[1.5,-1.5],[.5,-1.5],[.5,-.5],[-.5,-.5],[-1.5,-.5],[-1.5,.5],[-.5,.5],[.5,.5]],
        color: 'orange'
    },
    shapeO:{
        vertices:[[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1]],
        color: 'yellow'
    },
    shapeS:{
        //[[0,.5],[-1.5,.5],[-1.5,-.5],[-.5,-.5],[-.5,-1.5],[1.5,-1.5],[1.5,-.5],[.5,-.5],[.5,.5],[0,.5]]
        vertices:[[-.5,.5],[-1.5,.5],[-1.5,-.5],[-.5,-.5],[-.5,-1.5],[.5,-1.5],[1.5,-1.5],[1.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]],
        color: 'green'
    },
    shapeT:{
        //[[0,.5],[1.5,.5],[1.5,-.5],[.5,-.5],[.5,-1.5],[-.5,-1.5],[-.5,-.5],[-1.5,-.5],[-1.5,.5],[0,.5]]
        vertices:[[0,.5],[.5,.5],[1.5,.5],[1.5,-.5],[.5,-.5],[.5,-1.5],[-.5,-1.5],[-.5,-.5],[-1.5,-.5],[-1.5,.5],[-.5,.5],[0,.5]],
        color: 'purple'
    },
    shapeZ:{
        //[[0,.5],[1.5,.5],[1.5,-.5],[.5,-.5],[.5,-1.5],[-1.5,-1.5],[-1.5,-.5],[-.5,-.5],[-.5,.5],[0,.5]]
        vertices:[[.5,.5],[1.5,.5],[1.5,-.5],[.5,-.5],[.5,-1.5],[-.5,-1.5],[-1.5,-1.5],[-1.5,-.5],[-.5,-.5],[-.5,.5],[.5,.5]],
        color: 'red'
    },
}