export const tetrisShapes = {
    blockSize:40,
    onRotate: (oldVertices)=>{
        /*Trig coordinate transformation formula
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
    onBoundingBox: function(xPosition,yPosition,absVertices) {
        const xArr = absVertices.map((v)=>{
            return v[0] + xPosition
        })
        const yArr = absVertices.map((v)=>{
            return v[1] + yPosition
        })
        return [Math.min(...xArr),Math.max(...xArr),Math.min(...yArr),Math.max(...yArr)]
    },
    shapeL:{
        //armpit origin [[1,0],[1,1],[-1,1],[-1,-2],[0,-2]]
        //true center [[0,0.5],[1,0.5],[1,1.5],[-1,1.5],[-1,-1.5],[0,-1.5]]
        vertices:[[1,0],[1,1],[-1,1],[-1,-2],[0,-2]],
        absoluteVertices:function(){
            return (this.vertices.map((v)=>{
                return [v[0]*tetrisShapes.blockSize,v[1]*tetrisShapes.blockSize]
            }))
        },
        draw: function(canvasContext,xPosition,yPosition,rotationStage){
            const absVertices = this.absoluteVertices()
            canvasContext.beginPath()
            canvasContext.fillStyle ="red";
            canvasContext.moveTo(xPosition,yPosition)
            absVertices.forEach((v)=>{
                canvasContext.lineTo(xPosition+v[0],yPosition+v[1])
            })
            canvasContext.lineTo(xPosition,yPosition)
            canvasContext.fill();
            return tetrisShapes.onBoundingBox(xPosition,yPosition,absVertices)
        },
        rotate: function(){
            this.vertices = tetrisShapes.onRotate(this.vertices)
        }
        
    }
}