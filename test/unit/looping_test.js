import redtape from 'redtape';
import sinon from 'sinon';

import '../setup';
import {Looping} from '../../src/looping';

var sandbox,
    loop;

var test = redtape({
  beforeEach: (cb) => {
    sandbox = sinon.sandbox.create();
    loop = Object.create(Looping);
    cb();
  },
  afterEach: (cb) => {
    loop = {};
    sandbox.restore();
    cb();
  }
});

test('exists', t => {
  t.ok(Looping);
  t.end();
});

/*
 * =============================
 * fps
 * =============================
 */
test('fps setting should take value and update millisecondsPerFrame', t => {
  var expected = 50,
      actual;

  loop.fps = 10;
  actual = loop.millisecondsPerFrame;
  // TODO use config
  t.equal(actual, 100, 'sets millis per frame to fps / 1000');
  loop.fps = expected;
  actual = loop.millisecondsPerFrame;
  t.equal(actual, (1000 / expected),
      'again sets millis per frame to fps / 1000');

  t.end();
});

test('fps sets actual fps', t => {
  var expected = 25;

  loop.fps = 25;
  let actual = loop.fps;
  t.equal(actual, expected, 'fps is set to what it was set to');

  t.end();
});

/*
 * =============================
 * start()
 * =============================
 */
test('start() sets running to true', t => {

  t.ok(!loop.isRunning, 'starts out not running');
  loop.start();
  t.ok(loop.isRunning, 'starts to run');

  t.end();
});

test('start() launches loop', t => {
  var stub = sandbox.stub(Looping, 'launchLoop', () => { return; });

  loop.start();

  t.ok(stub.calledOnce, 'stub called once');

  t.end();
});


/*
 * =============================
 * stop()
 * =============================
 */
test('stop() sets to not running', t => {

  loop.start();
  t.ok(loop.isRunning, 'loop is running');
  loop.stop();
  t.ok(!loop.isRunning, 'loop is not running anymore');

  t.end();
});

/*
 * =============================
 * tick()
 * =============================
 */

test('tick() updates previousTime to current time', t => {
  var expected = 100;

  let stubClock = sandbox.stub(window.performance, 'now', () => {
    return expected;
  });

  loop.previousTime = 90;

  loop.tick();

  let actual = loop.previousTime;

  t.equal(actual, expected, 'previous time set to stubbed current time');

  t.end();
});

test('tick() adds onto lag to elapsed time from previous time', t => {
  var expected = 100;

  let stubClock = sandbox.stub(window.performance, 'now');
  stubClock.onFirstCall().returns(expected);
  stubClock.onSecondCall().returns(expected);
  let previous = loop.previousTime = 90;

  loop.tick();

  let actual = loop.lag;
  let previousLag = loop.lag;
  t.equal(actual, expected - previous, 'lag equals stubbed now minus previous');

  expected = 106;
  previous = loop.previousTime;
  stubClock.onSecondCall().returns(expected);
  loop.tick();

  actual = loop.lag;
  t.equal(actual, (expected - previous) + previousLag, 'lag value gets added on');

  t.end();
});

test('tick() updates frame to plus 1', t => {
  var stubClock = sandbox.stub(window.performance, 'now');
  stubClock.onFirstCall().returns(100);

  t.equal(loop.frame, 0, 'frame starts at 0');
  loop.tick();
  t.equal(loop.frame, 1, 'adds one to frame');

  t.end();
});

test('tick() calls every frame listeners', t => {
  var stubClock = sandbox.stub(window.performance, 'now'),
      spyA = sandbox.spy(),
      spyB = sandbox.spy();

  stubClock.onFirstCall().returns(100);
  loop.onEveryFrame(spyA);
  loop.onEveryFrame(spyB);

  loop.tick();
  t.ok(spyA.calledOnce, 'first listener called once');
  t.ok(spyB.calledOnce, 'second listener called once');

  t.end();
});

test('tick() updates the timers', t => {
  var stubClock = sandbox.stub(window.performance, 'now'),
      stub = sandbox.stub(loop, 'updateTimers');
  stubClock.onFirstCall().returns(100);

  loop.tick();
  t.ok(stub.calledOnce, 'calls updateTimers once');

  t.end();
});

test('tick() calls constantly listeners at least once', t => {
  var stubClock = sandbox.stub(window.performance, 'now'),
      spyA = sandbox.spy(),
      spyB = sandbox.spy();

  loop.previousTime = 90;
  stubClock.onFirstCall().returns(100);
  loop.onConstantly(spyA);
  loop.onConstantly(spyB);

  loop.tick();
  t.equal(spyA.callCount, 1, 'first listener called once');
  t.equal(spyB.callCount, 1, 'second listener called once');

  t.end();
});

test('tick() calls constantly listeners more then once when elapsed time ' +
    ' is greater then milliseconds per frame', t => {
  var stubClock = sandbox.stub(window.performance, 'now'),
      spy = sandbox.spy(),
      startTime = 100;

  loop.fps = 60;
  loop.previousTime = startTime;
  stubClock.onFirstCall().returns(startTime + 20); // current time
  stubClock.onSecondCall().returns(startTime + 20); // first while loop time
  stubClock.onThirdCall().returns(startTime + 40); // first while loop time
  loop.onConstantly(spy);

  loop.tick();
  t.equal(spy.callCount, 2, 'first listener called twice');

  t.end();
});
