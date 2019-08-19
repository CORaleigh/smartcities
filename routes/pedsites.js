var express = require('express');
var router = express.Router();
var rp = require('request-promise');

let countsArr = [];
let valueidArr = [];
let itemsProcessed = 0;
let siteIds;
let event;
const pedtoken = process.env.ECOVISIO_TOKEN;
// const pedhost = process.env.ECOVISIO_API;
const pedhost = 'https://apieco.eco-counter-tools.com';
let valueids;
let request = rp.defaults({
    headers: {
        'Authorization': `Bearer ${pedtoken}`
    }
});

router.get('/yesterday', function (req, res, next) {
    event = new Date();
    event.setDate(event.getDate() - 1);
    event = event.toISOString().slice(0, 10);
    event = event + 'T00:00:00';

    request(`${pedhost}/api/1.0/site`).then(body => {
        siteIds = JSON.parse(body);
        siteIds.forEach((value) => {
            valueidArr.push(value);
        });
    }).finally(() => {
        valueidArr.forEach((val) => {
            itemsProcessed++;
            request(`${pedhost}/api/1.0/data/site/${val.id}/?begin=${event}&step=day`).then(body => {
                valueids = JSON.parse(body);

                valueids.forEach((x) => {
                    if (x.status === 0) {
                        x.siteid = val.id;
                        x.latitude = val.latitude;
                        x.longitude = val.longitude;
                        x.name = val.name;
                    } else {
                        // if status is not 0 remove the item
                        valueids.splice(x.length);
                    }

                });

                countsArr.push(valueids);
                if (itemsProcessed === countsArr.length) {
                    res.send(JSON.stringify(countsArr));
                    countsArr.length = 0;
                    valueidArr.length = 0;
                    itemsProcessed = 0;
                }
            }).catch(err => {
                console.log('the error is ', err);
            })
        });
    }).catch(err => {
        console.log(err);
    });
});

router.get('/thisweek', function (req, res, next) {

    function getMonday(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    x = getMonday(new Date());
    x = x.toISOString().slice(0, 10);
    event = x + 'T00:00:00';

    request(`${pedhost}/api/1.0/site`).then(body => {
        siteIds = JSON.parse(body);
        siteIds.forEach((value) => {
            valueidArr.push(value);
        });
    }).finally(() => {
        valueidArr.forEach((val) => {
            itemsProcessed++;
            request(`${pedhost}/api/1.0/data/site/${val.id}/?begin=${event}&step=week`).then(body => {
                valueids = JSON.parse(body);

                valueids.forEach((x) => {
                    if (x.status === 0) {
                        x.siteid = val.id;
                        x.latitude = val.latitude;
                        x.longitude = val.longitude;
                        x.name = val.name;
                        x.weekcounts = x.counts;
                        delete x.counts;
                    } else {
                        // if status is not 0 remove the item
                        valueids.splice(x.length);
                    }
                });

                // replace counts with weekcounts
                var i;
                for (i = 0; i < countsArr.length; i++) {
                    countsArr[i].weekcounts = countsArr[i]['counts'];
                    delete countsArr[i].counts;
                }

                countsArr.push(valueids);
                if (itemsProcessed === countsArr.length) {
                    res.send(JSON.stringify(countsArr));
                    countsArr.length = 0;
                    valueidArr.length = 0;
                    itemsProcessed = 0;
                }
            }).catch(err => {
                console.log('the error is ', err);
            })
        });
    }).catch(err => {
        console.log(err);
    });
});

router.get('/thismonth', function (req, res, next) {

    date = new Date();
    var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    firstDayOfMonth = firstDayOfMonth.toISOString().slice(0, 10);
    event = firstDayOfMonth + 'T00:00:00';

    request(`${pedhost}/api/1.0/site`).then(body => {
        siteIds = JSON.parse(body);
        siteIds.forEach((value) => {
            valueidArr.push(value);
        });
    }).finally(() => {
        valueidArr.forEach((val) => {
            itemsProcessed++;
            request(`${pedhost}/api/1.0/data/site/${val.id}/?begin=${event}&step=month`).then(body => {
                valueids = JSON.parse(body);

                valueids.forEach((x) => {
                    if (x.status === 0) {
                        x.siteid = val.id;
                        x.latitude = val.latitude;
                        x.longitude = val.longitude;
                        x.name = val.name;
                        x.monthcounts = x.counts;
                        delete x.counts;
                    } else {
                        // if status is not 0 remove the item
                        valueids.splice(x.length);
                    }
                });
                // replace counts with weekcounts
                var i;
                for (i = 0; i < countsArr.length; i++) {
                    countsArr[i].monthcounts = countsArr[i]['counts'];
                    delete countsArr[i].counts;
                }
                countsArr.push(valueids);
                if (itemsProcessed === countsArr.length) {
                    res.send(JSON.stringify(countsArr));
                    countsArr.length = 0;
                    valueidArr.length = 0;
                    itemsProcessed = 0;
                }
            }).catch(err => {
                console.log('the error is ', err);
            })
        });
    }).catch(err => {
        console.log(err);
    });
});

router.get('/thisyear', function (req, res, next) {
    event = new Date();
    event.setDate(event.getDate());
    thisyear = event.getFullYear();
    event = event.toISOString().slice(0, 10);
    beginningOfYear = thisyear + '-01-01T00:00:00';
    event = beginningOfYear;

    request(`${pedhost}/api/1.0/site`).then(body => {
        siteIds = JSON.parse(body);
        siteIds.forEach((value) => {
            valueidArr.push(value);
        });
    }).finally(() => {
        valueidArr.forEach((val) => {
            itemsProcessed++;
            request(`${pedhost}/api/1.0/data/site/${val.id}/?begin=${event}&step=year`).then(body => {
                valueids = JSON.parse(body);
                valueids.forEach((x) => {
                    if (x.status === 0) {
                        x.siteid = val.id;
                        x.latitude = val.latitude;
                        x.longitude = val.longitude;
                        x.name = val.name;
                        x.yearcounts = x.counts;
                        delete x.counts;
                    } else {
                        // if status is not 0 remove the item
                        valueids.splice(x.length);
                    }
                });

                countsArr.push(valueids);
                if (itemsProcessed === countsArr.length) {

                    // countsArr = JSON.parse(countsArr);
                    // // delete counts since we have already added yearcounts
                    // var i;                    
                    // for (i = 0; i < countsArr.length; i++) {
                    //     console.log('counts is ', countsArr[i]);
                    //     delete countsArr.counts;
                    // }
                    res.send(JSON.stringify(countsArr));
                    countsArr.length = 0;
                    valueidArr.length = 0;
                    itemsProcessed = 0;
                }
            }).catch(err => {
                console.log('the error is ', err);
            })
        });
    }).catch(err => {
        console.log(err);
    });
});

module.exports = router;
