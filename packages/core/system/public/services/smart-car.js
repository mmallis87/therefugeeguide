(function(){

/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
/* SIMULATION MODE */
/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
demo_mode();

/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
/* TCP SOCKET */
/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
PUBNUB({
    subscribe_key : 'sub-c-11a62d48-72a1-11e5-9611-02ee2ddab7fe'
}).subscribe({
    channel : 'smart-car',
    message : receiver
});

/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
/* CHARTS */
/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
function receiver(updates) {

    // UPDATE CHARTS
    PUBNUB.each( updates, function( name, value ) {
        if (!charts[name]) return;
        charts[name].load({ columns: [['data', Math.floor(value)]] });
    } );

    // UPDATE DISPLAYS
    PUBNUB.each( updates, function( name, value ) {
        if (!displays[name]) return;
        displays[name].innerHTML = value;
    } );

    // UPDATE MAP
    if (updates['lat'] && updates['long']) {
        PUBNUB.events.fire(
            'map-waypoint',
            [updates['lat'], updates['long']]
        );
    }

}

/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
/* SIMULATION */
/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
var latlong = [-45, 73];

navigator.geolocation.getCurrentPosition(function (position) {
  console.log("I am located at: " + position.coords.latitude + ", " + position.coords.longitude);
  latlong = [position.coords.latitude,position.coords.longitude];
});

function simulate() {

    // SIMULATE CAR SPEED AND TACHOMETER
    PUBNUB.each( charts, function( name, chart ) {
        chart.load(simvalue(name));
    } );

    // SIMULATE CAR MOVEMENT
    PUBNUB.events.fire( 'map-waypoint', latlong );
    latlong[0] += Math.random()/1000 - Math.random()/2000;
    latlong[1] += Math.random()/1000 - Math.random()/2000;

    // SIMULATE TEMPERATURE
    displays.temperature.innerHTML = rnd( 30, 120 );

}
function rnd( min, max ) {
    return Math.floor(min + Math.random()*(max-min));
}
var r = +new Date;
function simvalue(chart) {
    var data = {
        tachometer : { columns: [['data', rnd( 2000, 12000 )]] },
        mph        : { columns: [['data', rnd( 1, 120 )]] }
    };

    if (!data[chart]) console.error("SIMULATION DATA NEEDED: '"+chart+"'");

    return data[chart] || { columns: [['data', 1]] }
}
function demo_mode() {
    setInterval( simulate, 400 );
}

/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
/* DISPLAY VALUES */
/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
var displays = {};
displays.temperature = PUBNUB.$('car-stat-temperature');
displays.latitude    = PUBNUB.$('car-stat-latitude');
displays.longitude   = PUBNUB.$('car-stat-longitude');

/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
/* TACHOMETER */
/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
var charts = {};
charts.tachometer = c3.generate({
    bindto     : PUBNUB.$('car-stat-chart-tachometer'),
    color      : { pattern: ['#fefefe'] },
    size       : { height: 228 },
    transition : { duration: 300 },
    data       : {
        columns : [ ['data', 6000] ],
        type    : 'gauge'
    },
    gauge : {
        min   : 0,
        max   : 12000,
        units : 'rpm',
        width : 20,
        label : { format: function( value, ratio ) { return value } }
    }
});

/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
/* MPH */
/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
charts.mph = c3.generate({
    bindto     : PUBNUB.$('car-stat-chart-mph'),
    color      : { pattern: ['#efefef'] },
    size       : { height: 228 },
    transition : { duration: 300 },
    data       : {
        columns: [ ['data', 25] ],
        type: 'gauge'
    },
    gauge : {
        min   : 0,
        max   : 160,
        units : 'mph',
        width : 130,
        label : { format: function(value, ratio) { return value } }
    }
});


})();
