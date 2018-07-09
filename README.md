# Tetris Proof of concept for chingu voyage 6 Bears Team 5

## Demo
https://dereje1.github.io/React-Canvas-Playground/

## Installation (Development Mode)
```
> cd client
> yarn
> yarn start
```
See initial concept here

https://codepen.io/Dee73/full/KeRYqV/

## Game Logic and flow

1) `componentDidMount` in `App.js`

1) `resetBoard()`

    1) Gets both major and minor canvas by `refs` , clears canvas, sets canvas context to be available in entire class
    2) Sets bottom boundary
    3) Sets Initial state from `initialState` constant
    4) Create `newShape()` and initilize with geometry
    4) Starts tick; `startTick()` >  `tick()`
2) Tick cycle `tick()`
    1) Drop active shape (Tetromino) by one unit (`state.activeShape.unitBlockSize`) every `state.timerInterval`
    2) Refresh screen with `updateScreen()`
3) `updateScreen()`
    1) clear canvas (`canvas.js` > `clearCanvas()`)
    2) Draw Tetromino based on current position (`canvas.js` > `drawShape()`) 
        1) Get Shape dimensions and geometry (`shapes.js` > `getDims()`) which returns the bounding box and absolute vertices of shape
        2) Draw with canvas using absolute vertices
        3) Return updated shape with bounding box and absolute vertices of shape
    3) Set state with active shape and rubble data
    4) Sweep screen with `screenMatrix()`
4) `screenMatrix()` - sweeps playable area (main canvas) by creating a matrix and locating active shape within the matrix
    1) Locate active Shape (`locateShape.js` > `shapeLocator()`)

        1) Create a `blocksPerRow X blocksPerColumn` grid and sweep to find active shape vertices and respond with 4 `[i,j]` cell coordinates

        2) Once all 4 cells found break out and return with the `[i,j]` values for all 4 cells
    2) Test for collision (see `collisionCheck`)
    3) If Collision found , let collision Check handle , if not, setState with the located shape
5) `collisionCheck()`
    1) `collision.js` > `runCollision()` If collision found return with a new rubble state, also looks for winning rows
        1) `runCollision()`, test proposed position for any collision, if found , combine active shape into `state.rubble.occupiedCells`, if not return `false`
        2) if collision found also check for winning row `winCheck()`,  if winner found `clearRows()` 
        3) return with new rubble state and with winner rows (if winners found)
    2) setState with new rubble geometry if collision found, then create `newShape()` and back to `updateScreen()`. If player area is all occupied `endTick()`

## Player Events

1) left and right arrows , move activeShape in x direction, 
    1) check for out of bounds (`leftOutOfBound` , `rightOutOfBound`) and check for occupied space
    2) `updateScreen()`
2) up arrow , rotates active shape , with `shapes.js` > `onRotate()`
    1) look out for walls (`boundingBox`)
    2) `updateScreen()`
3) down arrow 
    1) force run `tick()`


## Standards and measures taken from 
http://tetris.wikia.com/wiki/Tetris_Guideline




