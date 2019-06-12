var express = require('express');
var router = express.Router();
var rp = require('request-promise');

let valueidArr = [];
let countsArr = [];
let itemsProcessed = 0;
let siteIds;
let event;
// const pedtoken = process.env.PED_TOKEN;
const pedtoken = '';
const pedhost = "https://apieco.eco-counter-tools.com";
let mergeObj = [];
let valueids;
let request = rp.defaults({
    headers: {
        'Authorization': `Bearer ${pedtoken}`
    }
});

router.get('/', function (req, res, next) {
    event = new Date();
    event.setDate(event.getDate() - 1);
    event = event.toISOString().slice(0, 10);
    event = event + 'T00:00:00';

    request(`${pedhost}/api/1.0/site`).then(body => {
        console.log(body);
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
                    console.log('x ', x);
                    x.siteid = val.id;
                    x.latitude = val.latitude;
                    x.longitude = val.longitude;
                });
                
                countsArr.push(valueids);
                // countsArr.push(val.id);
                if (itemsProcessed === countsArr.length) {
                    res.send(JSON.stringify(countsArr));
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
