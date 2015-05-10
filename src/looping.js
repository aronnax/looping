
/**
 * @file looping Holds the Looping module
 */

import 'babel/polyfill';

const FPS = 60,
      MILLISECONDSPERFRAME = 100 / FPS,
      USE_POOLING = true;

export var Looping = {

  _constantlyListeners: [],
  _everyFrameListeners: [],
  _fps: FPS,
  _isRunning: false,
  _millisecondsPerFrame: MILLISECONDSPERFRAME,
  _requestId: 0,
  _frameStop: 0,

  /**
   * The number of milliseconds for each frame should be based on
   * the fps
   * @type Date
   */
  previousTime: 0,

  /**
   * The lag since the last loop completion, used to determine whether
   * to update more until the next draw.
   * @type Boolean
   */
  lag: 0,

  /**
   * The total frames run since the first call.
   * @type Number
   */
  frame: 0,

  /**
   * The frames per second the game should run at defaults to 60
   * @default 60
   * @type Number
   */
  get fps() { return this._fps; },
  set fps(amount) {
    this._fps = amount;
    this._millisecondsPerFrame = 1000 / this._fps;
  },

  /**
   * The number of milliseconds for each frame should be based on
   * the fps
   * @protected
   * @type Number
   */
  get millisecondsPerFrame() {
    return this._millisecondsPerFrame;
  },


  /**
   * Whether the game is currently running or not, used to actually
   * stop the loop.
   * @readonly
   * @type Boolean
   */
  get isRunning() {
    return this._isRunning;
  },

  /**
   * The ID of the animation frame, returned from requestAnimationFrame.
   * @readonly
   * @type Number
   */
  get requestId() { return this._requestId; },

  /**
   * Moves the game forward by one tick. Will call update continually if
   * lag is larger or equal to milliseconds per frame. Will call draw
   * at the end of every loop and will update total frames.
   */
  tick() {
    var currentTime = window.performance.now(),
        elapsed;

    elapsed = currentTime - this.previousTime;
    this.previousTime = currentTime;
    this.lag += elapsed;

    while (this.lag >= this._millisecondsPerFrame) {
      //let beforeUpdate = window.performance.now()
      this._constantly(this.lag / this._millisecondsPerFrame);
      //let afterUpdate = window.performance.now();
      //this.lag -= afterUpdate - beforeUpdate;
      this.lag -= this.millisecondsPerFrame;
    }
    //this._constantly(this.lag / this._millisecondsPerFrame);
    this._everyFrame(this.lag / this._millisecondsPerFrame);
    this.updateTimers(this.lag / this._millisecondsPerFrame);
    this.frame++;
    if (this._frameStop === this.frame) {
      this._isRunning = false;
      this._onFrameStop();
    }
  },

  /**
   * Creates a loop that runs tick by request animation frames. Will
   * check the isRunning boolean to see if it should continue running.
   * Initializes previousTime and lag.
   */
  launchLoop() {
    var runner,
        self = this;

    this.previousTime = window.performance.now();;
    this.lag = 0;

    runner = () => {
      self.tick();
      if (this._isRunning) {
        this._requestId = requestAnimationFrame(runner);
      }
    };
    runner();
  },

  /**
   * Update all the variable time timers.
   */
  updateTimers() {

  },

  /**
   * Run a function on every frame. This means it syncs with current fps.
   * @param {Function} cb The function to call.
   *
   * callback function with pass the following params:
   *   - dtTime: The current time delta.
   */
  onEveryFrame(cb) {
    this._everyFrameListeners = this._everyFrameListeners || [];
    this._everyFrameListeners.push(cb);
  },

  /**
   * Run a function as constantly as possible, either on every frame, or if
   * there's missed frames due to log, run every step.
   * @param {Function} cb The function to call.
   *
   * callback function with pass the following params:
   *   - dtTime: The current time delta.
   */
  onConstantly(cb) {
    this._constantlyListeners = this._constantlyListeners || [];
    this._constantlyListeners.push(cb);
  },

  /**
   * Runs the game if not already running, sets the game to running.
   */
  start() {
    if (!this._isRunning) {
      this._isRunning = true;
      this.launchLoop();
    }
  },

  /**
   * Stops the game by setting it to not running.
   */
  stop() {
    this._isRunning = false;
  },

  onEveryMilli(millis, cb) => {
    throw new Error('Not implemented');
  },

  onEverySecs(secs, cb) => {
    throw new Error('Not implemented');
  },

  onEveryMins(mins, cb) => {
    throw new Error('Not implemented');
  },

  _stopOnFrame(frameNumber, cb) {
    this._frameStop = frameNumber;
    this._onFrameStop = cb;
  },

  _everyFrame(dtMilli) {
    this._callListeners(this._everyFrameListeners, dtMilli)
  },

  _constantly(dtMilli) {
    this._callListeners(this._constantlyListeners, dtMilli)
  },

  _callListeners(listeners, dtMilli) {
    for (let listener of listeners) {
      listener(dtMilli);
    }
  }
};
