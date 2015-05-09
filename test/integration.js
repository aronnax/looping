/**
 *
 * Created by msecret on 4/28/15.
 */

import redtape from 'redtape';

import './setup';
import {Looping} from '../src/looping';


var test = redtape({
  beforeEach: (cb) => {
    cb();
  },
  afterEach: (cb) => {
    cb();
  }
});

test('exists', t => {
  t.ok(Looping);
  t.end();
});

test('general interface works', t => {
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

  t.end();
});

