import React from 'react';
import './Demo.css';

// connect to redux and get action creators
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUser } from '../../Actions/authentication';

// custom functions
import tetrisShapes from './scripts/shapes';
import shapeLocator from './scripts/locateShape';
import runCollision from './scripts//collision';
import { clearCanvas, drawShape, winRubble, drawNextShape } from './scripts/canvas';

// reads from store
const mapStateToProps = state => state;

// writes to store
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getUser,
  }, dispatch),
});

// end redux
const initialState = { // determine what needs to go into state, a very small portion here
  timerInterval: 700,
  paused: false,
  nextShape: '',
  canvas: {
    canvasMajor: {
      width: 300,
      height: 600,
    },
    canvasMinor: {
      width: 210,
      height: 150,
    },
  },
  points: {
    totalLinesCleared: 0,
    level: 0,
    levelUp: 5,
  },
  rubble: {// all screen info of rubble
    occupiedCells: [],
    winRows: null,
    boundaryCells: [],
  },
  activeShape: {// all geometric info of active shape
    name: 'shapeZ',
    unitBlockSize: 30,
    xPosition: 0,
    yPosition: 0,
    unitVertices: [],
    absoluteVertices: [],
    boundingBox: [],
    rotationStage: 0,
    cells: [],
  },
};
class Demo extends React.Component {

  constructor(props) {
    super(props);
    this.state = initialState;
    this.canvasMajor = React.createRef();
    this.canvasMinor = React.createRef();
  }
  componentDidMount() {
    this.resetBoard();
  }
  componentDidUpdate(prevProps, prevState) {
    if ((this.state.points.level !== prevState.points.level) && (this.state.timerInterval > 250)) {
      this.endTick('Level Change');
      this.speedUp();
    }
  }

  componentWillUnmount() {
    this.endTick('componentWillUnmount');
  }
  getSideBlock = (direction) => {
    const cellCheck = this.state.activeShape.cells.map((c) => {
      if (direction === 'L') {
        return [c[0] - 1, c[1]].join('-');
      }
      return [c[0] + 1, c[1]].join('-');
    });
    const occupiedCellLocations = this.state.rubble.occupiedCells.map(c => c[0]);
    const blocked = cellCheck.filter(c => occupiedCellLocations.includes(c));
    return !!blocked.length;
  }

  getRandShapeName = () => {
    const shapeList = ['shapeL', 'shapeZ', 'shapeT', 'shapeI', 'shapeJ', 'shapeO', 'shapeS'];
    const randNum = Math.floor(Math.random() * (shapeList.length));
    return shapeList[randNum];
  }
  speedUp = () => {
    this.setState({
      timerInterval: this.state.timerInterval - 150,
    }, () => this.startTick());
  }
  resetBoard =() => { // clear and restart
    const canvasMajor = this.canvasMajor.current;
    const canvasMinor = this.canvasMinor.current;
    canvasMajor.focus();
    canvasMajor.style.backgroundColor = 'black';
    canvasMinor.style.backgroundColor = 'black';
    // setting context so it can be accesible everywhere in the class , maybe a better way ?
    this.canvasContextMajor = canvasMajor.getContext('2d');
    this.canvasContextMinor = canvasMinor.getContext('2d');
    if (this.downInterval) this.endTick('reset Board');
    // set bottom boundary by occupying cells
    if (!initialState.rubble.boundaryCells.length) {
      const b = this.state.activeShape.unitBlockSize;
      const blocksPerRow = this.state.canvas.canvasMajor.width / b;
      const blocksPerColumn = this.state.canvas.canvasMajor.height / b;
      for (let i = 0; i < blocksPerRow; i += 1) {
        initialState.rubble.boundaryCells.push(`${i}-${blocksPerColumn}`);
      }
    }
    this.setState(initialState, () => this.startTick());
  }

  newShape = () => {
    const randomShape = this.state.nextShape ? this.initializeShape(this.state.nextShape) :
      this.initializeShape(this.getRandShapeName());
    const nextShape = this.getRandShapeName();
    const nextShapeInfo = this.initializeShape(nextShape);

    this.setState({
      nextShape,
    }, () => drawNextShape(this.canvasContextMinor, nextShapeInfo, this.state));

    let copyOfActiveShape = Object.assign({}, this.state.activeShape);
    // I and O shapes need right offset
    if (randomShape[0] !== 'shapeI' && randomShape[0] !== 'shapeO') {
      copyOfActiveShape.xPosition = (this.state.canvas.canvasMajor.width / 2) +
      (this.state.activeShape.unitBlockSize / 2);
    } else {
      copyOfActiveShape.xPosition = (this.state.canvas.canvasMajor.width / 2);
    }
    copyOfActiveShape = randomShape;
    copyOfActiveShape.yPosition = -1 * randomShape.boundingBox[2];

    this.updateScreen(copyOfActiveShape);
  }
  startTick = () => {
    this.abortCounter = 0;
    if (this.downInterval)clearInterval(this.downInterval);
    this.newShape();
    this.downInterval = setInterval(() => {
      this.tick();
    }, this.state.timerInterval);
  }
  endTick = (c) => {
    this.abortCounter += 1;
    console.log(`Called by ${c} , attempts = ${this.abortCounter}`);
    clearInterval(this.downInterval);
    this.setState({
      paused: true,
    });
  }
  tick = () => {
    if (this.state.paused) return;
    // handle y direction movements
    const copyOfActiveShape = Object.assign({}, this.state.activeShape);
    // console.log(`bbox @ tick ${this.state.activeShape.boundingBox}`)
    copyOfActiveShape.yPosition += this.state.activeShape.unitBlockSize;
    this.updateScreen(copyOfActiveShape);
  }

  updateScreen = (updatedShape) => {
    clearCanvas(this.canvasContextMajor, this.state); // clear canvasMajor
    const drawReturn = drawShape(this.canvasContextMajor, updatedShape, this.state);
    const copyOfRubble = Object.assign({}, this.state.rubble);
    copyOfRubble.winRows = null; // need to reset back to null incase of previous win
    this.setState({
      activeShape: drawReturn,
      rubble: copyOfRubble,
      paused: false,
    }, () => this.screenMatrix());
  }

  screenMatrix = () => { // sweep playable area
    const locatedShape = shapeLocator(
      this.canvasContextMajor,
      this.state.canvas.canvasMajor.width,
      this.state.canvas.canvasMajor.height,
      this.state.activeShape, false,
    );
    const testCollision = this.collisionCheck(locatedShape);
    // if no collison store cell coordinates in state for future comparison
    if (!testCollision) {
      this.setState({
        activeShape: locatedShape,
      });
    }
  }


  initializeShape = (shapeName) => {
    // finding intital y bound so it does not get cutoff
    const x = (shapeName !== 'shapeI' && shapeName !== 'shapeO') ?
      (this.state.canvas.canvasMajor.width / 2) + (this.state.activeShape.unitBlockSize / 2) :
      this.state.canvas.canvasMajor.width / 2;

    const initialAbsoluteVertices = tetrisShapes.getAbsoluteVertices(
      this.state.activeShape.unitBlockSize,
      x,
      0,
      tetrisShapes[shapeName].vertices,
    );

    const initialBoundingBox = tetrisShapes.onBoundingBox(initialAbsoluteVertices);
    const activeShape = {
      name: shapeName,
      unitBlockSize: 30,
      xPosition: x,
      yPosition: 0,
      unitVertices: tetrisShapes[shapeName].vertices,
      absoluteVertices: initialAbsoluteVertices,
      boundingBox: initialBoundingBox,
      rotationStage: 0,
      cells: [],
    };
    return activeShape;
  }

  collisionCheck = (testShape) => {
    const copyOfPoints = Object.assign({}, this.state.points);
    const copyOfRubble = Object.assign({}, this.state.rubble);
    const collisionResult = runCollision(this.state, testShape);

    if (collisionResult) { // found collision
      // check if game space is all occupied
      if (collisionResult === 'done') {
        this.endTick('collision check - game done');
        return 'done';
      }
      // retreive total rows cleared (if any) and test for time interval reduction
      const rowsCleared = collisionResult[1] ? collisionResult[1].length : 0;
      // assign points if winner found
      copyOfPoints.totalLinesCleared = this.state.points.totalLinesCleared + rowsCleared;
      copyOfPoints.level = Math.floor(copyOfPoints.totalLinesCleared / (this.state.points.levelUp));
      // assign new rubble coordinates
      [copyOfRubble.occupiedCells, copyOfRubble.winRows] = collisionResult;
      if (rowsCleared) { // winner found
        // end tick to play animation and start tick back after animation is over
        this.endTick('collision check - winning row');
        clearCanvas(this.canvasContextMajor, this.state); // clear canvasMajor
        winRubble(this.canvasContextMajor, this.state.activeShape, this.state, collisionResult[1]);
        const inter = setTimeout(() => {
          this.setState({
            rubble: copyOfRubble,
            points: copyOfPoints,
          }, () => this.startTick());
          clearInterval(inter);
        }, 250);
      } else { // no winner found just set state with current rubble
        this.setState({
          rubble: copyOfRubble,
          points: copyOfPoints,
        }, () => this.newShape());
      }
    } else {
      return false;
    }
    return null;
  }
  handlePause = () => {
    this.canvasMajor.current.focus();
    this.setState({
      paused: !this.state.paused,
    });
  }
  /* handle all player movements below */
  playerMoves = (e) => {
    if (this.state.paused) return;
    const left = e.keyCode === 37;
    const right = e.keyCode === 39;
    const up = e.keyCode === 38;
    const down = e.keyCode === 40;


    if (!(left || right || up || down)) return; // do nothing for any other keypress

    // check X boundaries
    const leftOutOfBound = left && (this.state.activeShape.boundingBox[0] -
       this.state.activeShape.unitBlockSize) < 0;
    const rightOutOfBound = right && (this.state.activeShape.boundingBox[1] +
      this.state.activeShape.unitBlockSize) > this.state.canvas.canvasMajor.width;
    if (leftOutOfBound || rightOutOfBound) return;

    const copyOfActiveShape = Object.assign({}, this.state.activeShape);
    if (left) {
      if (this.getSideBlock('L')) return;
      copyOfActiveShape.xPosition -= this.state.activeShape.unitBlockSize;
      this.updateScreen(copyOfActiveShape);
    } else if (right) {
      if (this.getSideBlock('R')) return;
      copyOfActiveShape.xPosition += this.state.activeShape.unitBlockSize;
      this.updateScreen(copyOfActiveShape);
    } else if (down) this.tick();
    else this.rotation(this.state.activeShape);
  }

  rotation = (active) => {
    const unitVerticesAfterRotation = tetrisShapes.onRotate(active.unitVertices);
    const boundingBox = tetrisShapes.onBoundingBox(tetrisShapes.getAbsoluteVertices(
      this.state.activeShape.unitBlockSize,
      this.state.activeShape.xPosition,
      this.state.activeShape.yPosition,
      unitVerticesAfterRotation,
    ));
    const absoluteVertices = tetrisShapes.getAbsoluteVertices(
      this.state.activeShape.unitBlockSize,
      this.state.activeShape.xPosition,
      this.state.activeShape.yPosition,
      unitVerticesAfterRotation,
    );

    const rotatedShape = Object.assign({}, this.state.activeShape);
    rotatedShape.unitVertices = unitVerticesAfterRotation;
    rotatedShape.rotationStage = rotatedShape.rotationStage > 2 ?
      0 :
      rotatedShape.rotationStage + 1;
    rotatedShape.cells = [];
    rotatedShape.absoluteVertices = absoluteVertices;
    rotatedShape.boundingBox = boundingBox;

    // crude wall kicks, ideally should translate with a recursive function
    if (
      boundingBox[0] < 0 ||
      boundingBox[1] > this.state.canvas.canvasMajor.width
    ) { // side wall kicks
      const translateUnits = this.state.activeShape.name === 'shapeI' ? 2 : 1;
      if (boundingBox[0] < 0) { // translate to the left
        rotatedShape.xPosition += (translateUnits * this.state.activeShape.unitBlockSize);
      } else { // translate to the right
        rotatedShape.xPosition -= (translateUnits * this.state.activeShape.unitBlockSize);
      }
    }
    // locate shape to check collision on rotation, if collision detected do not rotate shape
    const locatedShape = shapeLocator(
      this.canvasContextMajor,
      this.state.canvas.canvasMajor.width,
      this.state.canvas.canvasMajor.height,
      rotatedShape, false,
    );
    if (!runCollision(this.state, locatedShape)) this.updateScreen(rotatedShape);
  }


  render() {
    return (
      <div className="democontainer">
        <div className="controls">
          <canvas
            ref={this.canvasMinor}
            width={this.state.canvas.canvasMinor.width}
            height={this.state.canvas.canvasMinor.height}
            tabIndex="0"
          />
          <button className="reset" onClick={() => this.resetBoard()}>
            Reset
          </button>
          <label htmlFor="test">Lines Cleared = {this.state.points.totalLinesCleared}</label>
          <label htmlFor="test">Level = {this.state.points.level}</label>
          <label htmlFor="test">
            Pause:
            <input
              name="Pausing"
              type="checkbox"
              value={this.state.paused}
              onChange={this.handlePause}
            />
          </label>
        </div>
        <canvas
          ref={this.canvasMajor}
          width={this.state.canvas.canvasMajor.width}
          height={this.state.canvas.canvasMajor.height}
          tabIndex="0"
          onKeyDown={e => this.playerMoves(e)}
        />
      </div>
    );
  }

}


export default connect(mapStateToProps, mapDispatchToProps)(Demo);
