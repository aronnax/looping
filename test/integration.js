/**
 *
 * Created by msecret on 4/28/15.
 */

import sinon from 'sinon';
import redtape from 'redtape';

import './setup';
import {Looping} from '../src/looping';

var sandbox;

var test = redtape({
  beforeEach: (cb) => {
    sandbox = sinon.sandbox.create();
    cb();
  },
  afterEach: (cb) => {
    sandbox.restore();
    cb();
  }
});

test('exists', t => {
  t.ok(Looping);
  t.end();
});

test('onEveryFrame runs every frame with delta time param', t => {
  var loop = Object.create(Looping),
      spy = sandbox.spy();

  loop.onEveryFrame(spy);
  loop._stopOnFrame(3, () => {
    t.ok(spy.called, 'spy called');
    t.equal(spy.callCount, 3, 'is called 3 times');
    t.end();
  });

  loop.start();

  t.end();
});

test('general interface works', t => {
  /*
  var loop = Object.create(Looping);

  loop.onEveryFrame((dtmilli, totaltimemilli) => {
    // like render
  });
  loop.onConstantly((dtmilli, totaltimemilli) => {

  });
  loop.onMilli(300, () => {

  });
  loop.onSecs(1, () => {

  });
  loop.onMins(2, () => {

  });

  loop.start();

  loop.stop();
  */

  t.end();
});

