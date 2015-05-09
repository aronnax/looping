
/**
 * @file pooled Holds the Looping module
 */

const fpsDefault = 60,
      millisecondsPerFrameDefault = 1000 / fpsDefault;

export var Looping = {

  _fps: fpsDefault,

  _millisecondsPerFrame: millisecondsPerFrameDefault,

  requestId: 0,

  _isRunning: false,

  _constantlyListeners: [],
  _everyFrameListeners: [],



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
      let beforeUpdate = window.performance.now()
      this.constantly(this.lag / this._millisecondsPerFrame);
      let afterUpdate = window.performance.now();
      this.lag -= afterUpdate - beforeUpdate;
    }
    this.constantly(this.lag / this._millisecondsPerFrame);
    this.everyFrame(this.lag / this._millisecondsPerFrame);
    this.updateTimers(this.lag / this._millisecondsPerFrame);
    this.frame++;
  },

  /**
   * Creates a loop that runs tick by request animation frames. Will
   * check the isRunning boolean to see if it should continue running.
   * Initializes previousTime and lag.
   */
  launchLoop() {
    var runner,
        self = this;

    this.previousTime = (new Date()).getTime();
    this.lag = 0;

    return;
    runner = () => {
      self.tick();
      if (this._isRunning) {
        this._requestId = requestAnimationFrame(runner);
      }
    };
    runner();
  },

  everyFrame(dtMilli) {
    this.callListeners(this._everyFrameListeners, dtMilli)
  },

  constantly(dtMilli) {
    this.callListeners(this._constantlyListeners, dtMilli)
  },

  updateTimers() {

  },

  callListeners(listeners, dtMilli) {
    for (let listener of listeners) {
      listener(dtMilli);
    }
  },

  onEveryFrame(cb) {
    this._everyFrameListeners = this._everyFrameListeners || [];
    this._everyFrameListeners.push(cb);
  },

  onConstantly(cb) {
    this._constantlyListeners = this._constantlyListeners || [];
    this._constantlyListeners.push(cb);
  },

  /**
   * Runs the game if not already running, runs the loop with launchLoop.
   */
  start() {
    if (!this._isRunning) {
      this._isRunning = true;
      this.launchLoop();
    }
  },

  /**
   * Stops the game by changing the isRunning variable.
   */
  stop() {
    this._isRunning = false;
  }
};
