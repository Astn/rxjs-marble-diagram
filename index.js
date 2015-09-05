var rx = require('rx')
var _ = require('lodash');

var marbles = new rx.Subject()
var marbleMassaged = [];
var msub = marbles
            .scan(function (acc, x) { return {ct:acc.ct + 1, payload:x}; }, {ct:0})
            .groupBy(function(x) {return x.payload.topic;},
                     function(x) {return x;})
            .subscribe(function(f){
              var entry = {key:f.key,values:[]};
              marbleMassaged.push(entry);
              f.subscribe(function(g){
                entry.values.push(g);
                //console.log(g);
              });
            },
            function(err){},
            function(){
              //console.log(marbleMassaged);
            });

var track = function(topic, payload) {
  marbles.onNext({topic:topic, payload: payload});
}

var input = rx.Observable.fromArray([{a:1,b:2,step:1},{a:3,b:4,step:2},{a:1,b:3,step:3}]);
var shared = input.do(function (f) {track('input',f);}).publish();
  var channel1 = shared
            .filter(function(f) { return f.step === 1;})
            .do(function (f) {track('dev filter == 1',f);})
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
            .do(function (f) {track('prod filter == 3',f);})
            .map(function (f) { return {a:f.a+10,b:f.b+10};})
            .do(function (f) {track('prod',f);})
            .subscribe(function(i) { //console.log(i);
            });
shared.connect();
marbles.onCompleted();

var render = function(data) {
  return '<div class="marble-diagram">' +
    _.map(data, function(line){
      var header = '<span class="marble-header">'+line.key+'</span>';
      var marbleGroup = '<div class="marble-group">' + header +
                        _.map(line.values, function(marble){
                          return '<span class="marble" title="'+JSON.stringify(marble.payload.payload)+'">'
                          +marble.payload.payload.step+'</span>';
                        }).reduce(function(total,n){return total+n;}) +
                        '</div>';
      return marbleGroup;
    }).reduce(function(total,n){return total+n;}) + '</div>';
}
var html = '<html><head>\
<style>\
  .marble {text-layout:inline;}\
</style>\
</head><body>' + render(marbleMassaged) + '</body>';
console.log(html);
console.log(JSON.stringify(marbleMassaged));
