export const tetrisShapes = {
    rectangle:{
        centerX: 0,
        centerY:0,
        width: 150,
        height: 50,
        draw: function(canvasContext,xPosition,yPosition){
            canvasContext.beginPath()
            canvasContext.fillStyle ="red";
            canvasContext.moveTo(xPosition,yPosition)
            canvasContext.lineTo(xPosition + this.width,yPosition)
            canvasContext.lineTo(xPosition + this.width, yPosition + this.height)
            canvasContext.lineTo(xPosition, yPosition + this.height)
            canvasContext.lineTo(xPosition,yPosition)
            canvasContext.fill();
        },
        rotate: function(xPosition,yPosition){
            const theta=90*Math.PI/180
            const p = xPosition + this.width/2
            const q = yPosition + this.height/2
            const xPrime = (xPosition - p)* Math.cos(theta)-
                ((yPosition + this.height) - q)* Math.sin(theta) + p
            const yPrime = (xPosition - p)* Math.sin(theta)-
                ((yPosition + this.height) - q)* Math.cos(theta) + q
            const temp = this.width
            this.width= this.height
            this.height = temp
            return [xPrime,yPrime]
        }
    },
    linear:{
        centerX: 0,
        centerY:0,
        width: 150,
        height: 50,
        draw: function(canvasContext,xPosition,yPosition,rotationStage){
            switch (rotationStage) {
                case 0:
                    canvasContext.beginPath()
                    canvasContext.fillStyle ="red";
                    canvasContext.moveTo(xPosition,yPosition)
                    canvasContext.lineTo(xPosition + this.width,yPosition)
                    canvasContext.lineTo(xPosition + this.width, yPosition + this.height/2)
                    canvasContext.lineTo(xPosition + this.width/4, yPosition + this.height/2)
                    canvasContext.lineTo(xPosition + this.width/4, yPosition + this.height)
                    canvasContext.lineTo(xPosition, yPosition + this.height)
                    canvasContext.lineTo(xPosition,yPosition)
                    canvasContext.fill();
                    break;
                case 1:
                    canvasContext.beginPath()
                    canvasContext.fillStyle ="red";
                    canvasContext.moveTo(xPosition,yPosition)
                    canvasContext.lineTo(xPosition + this.height,yPosition)
                    canvasContext.lineTo(xPosition + this.height, yPosition + this.width)
                    canvasContext.lineTo(xPosition + this.height/2, yPosition + this.width)
                    canvasContext.lineTo(xPosition + this.height/2, yPosition + this.width/4)
                    canvasContext.lineTo(xPosition, yPosition + this.width/4)
                    canvasContext.lineTo(xPosition,yPosition)
                    canvasContext.fill();
                    break;
                case 2:
                    canvasContext.beginPath()
                    canvasContext.fillStyle ="red";
                    canvasContext.moveTo(xPosition,yPosition)
                    canvasContext.lineTo(xPosition + (3*this.width/4),yPosition)
                    canvasContext.lineTo(xPosition + (3*this.width/4), yPosition - this.height/2)
                    canvasContext.lineTo(xPosition + this.width, yPosition - this.height/2)
                    canvasContext.lineTo(xPosition + this.width, yPosition + this.height/2)
                    canvasContext.lineTo(xPosition, yPosition + this.height/2)
                    canvasContext.lineTo(xPosition,yPosition)
                    canvasContext.fill();
                    break;
                case 3:
                    canvasContext.beginPath()
                    canvasContext.fillStyle ="red";
                    canvasContext.moveTo(xPosition,yPosition)
                    canvasContext.lineTo(xPosition + this.height/2, yPosition)
                    canvasContext.lineTo(xPosition + this.height/2, yPosition + (3*this.width/4))
                    canvasContext.lineTo(xPosition + this.height, yPosition + (3*this.width/4))
                    canvasContext.lineTo(xPosition + this.height, yPosition + this.width)
                    canvasContext.lineTo(xPosition, yPosition + this.width)
                    canvasContext.lineTo(xPosition,yPosition)
                    canvasContext.fill();
                    break;
                default:
                    break;
            }
        }
    },
    dynamic:{
        vertices:[[0,0.5],[1,0.5],[1,1.5],[-1,1.5],[-1,-1.5],[0,-1.5]],
        blockSize:40,
        absoluteVertices:function(){
            return (this.vertices.map((v)=>{
                return [v[0]*this.blockSize,v[1]*this.blockSize]
            }))
        },
        draw: function(canvasContext,xPosition,yPosition){
            const absVertices = this.absoluteVertices()
            canvasContext.beginPath()
            canvasContext.fillStyle ="red";
            canvasContext.moveTo(xPosition,yPosition)
            absVertices.forEach((v)=>{
                canvasContext.lineTo(xPosition+v[0],yPosition+v[1])
            })
            canvasContext.lineTo(xPosition,yPosition)
            canvasContext.fill();
        },
        rotate: function(xPosition,yPosition){
            const theta=90*Math.PI/180
            const newVertices = this.vertices.map((v)=>{
                const xPrime = v[0]* Math.cos(theta) - v[1]* Math.sin(theta)
                const yPrime = v[0]* Math.sin(theta) - v[1]* Math.cos(theta)
                return [xPrime,yPrime]
            })
            this.vertices = newVertices
        }

    }
}
/*
        //[[0,0.5],[1,0.5],[1,1.5],[-1,1.5],[-1,1.5],[0,1.5]]
        //[[1,0],[1,2],[2,2],[2,3],[0,3]]
        vertices:[[0,0.5],[1,0.5],[1,1.5],[-1,1.5],[-1,-1.5],[0,-1.5]],
        blockSize:40,
        absoluteVertices:function(){
            return (this.vertices.map((v)=>{
                return [v[0]*this.blockSize,v[1]*this.blockSize]
            }))
        },
        center:[0,0],
        draw: function(canvasContext,xPosition,yPosition){
            const absVertices = this.absoluteVertices()
            canvasContext.beginPath()
            canvasContext.fillStyle ="red";
            canvasContext.moveTo(xPosition,yPosition)
            absVertices.forEach((v)=>{
                canvasContext.lineTo(xPosition+v[0],yPosition+v[1])
            })
            canvasContext.lineTo(xPosition,yPosition)
            canvasContext.fill();
        },
        rotate: function(xPosition,yPosition){
            const theta=90*Math.PI/180
            const p = this.center[0]
            const q = this.center[1]

            const newVertices = this.vertices.map((v)=>{
                const xPrime = (v[0] - p)* Math.cos(theta)-
                               (v[1] - q)* Math.sin(theta) + p
                const yPrime = (v[0] - p)* Math.sin(theta)-
                               (v[1] - q)* Math.cos(theta) + q
                console.log(v,xPrime,yPrime)
                return [xPrime,yPrime]
            })
            console.log(this.vertices)
            this.vertices = newVertices
            console.log(this.vertices)
            return [xPosition,yPosition]
            */