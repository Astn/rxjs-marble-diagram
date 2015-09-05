var rx = require('rx')

var marbles = new rx.Subject()

var msub = marbles.scan(function (acc, x) { return {ct:acc.ct + 1, payload:x}; }, {ct:0})
            .subscribe(function(f){ console.log(f); });

var track = function(topic, payload) {
  marbles.onNext({topic:topic, payload: payload});
}

var input = rx.Observable.fromArray([{a:1,b:2,step:1},{a:3,b:4,step:2},{a:1,b:3,step:3}]);
var shared = input.do(function (f) {track('input',f);}).publish();
  var channel1 = shared
            .filter(function(f) { return f.step === 1;})
            .do(function (f) {track('stg filter == 1',f);})
            .map(function (f) { return {a:f.a+10,b:f.b+10};})
            .do(function (f) {track('dev',f);})
            .subscribe(function(i) { //console.log(i);
            });

  var channel2 = shared
            .filter(function(f) { return f.step === 2;})
            .do(function (f) {track('stg filter == 2',f);})
            .map(function (f) { return {a:f.a+10,b:f.b+10};})
            .do(function (f) {track('stg',f);})
            .subscribe(function(i) { //console.log(i);
            });

  var channel3 = shared
            .filter(function(f) { return f.step === 3;})
            .do(function (f) {track('stg filter == 3',f);})
            .map(function (f) { return {a:f.a+10,b:f.b+10};})
            .do(function (f) {track('prod',f);})
            .subscribe(function(i) { //console.log(i);
            });
shared.connect();
