var express = require('express');
var router = express.Router();
var rp = require('request-promise');

let countsArr = [];
let valueidArr = [];
let itemsProcessed = 0;
let siteIds;
let event;
// const pedtoken = process.env.ECOVISIO_TOKEN;
const pedtoken = 'b677de8fb7e673a0b6d194d4f4b8af63';
// const pedhost = process.env.ECOVISIO_API;
const pedhost = 'https://apieco.eco-counter-tools.com';
let valueids;
let request = rp.defaults({
    headers: {
        'Authorization': `Bearer ${pedtoken}`
    }
});

router.get('/', function (req, res, next) {
    // countsArr.length = 0;

    event = new Date();
    event.setDate(event.getDate() - 1);
    event = event.toISOString().slice(0, 10);
    event = event + 'T00:00:00';

    request(`${pedhost}/api/1.0/site`).then(body => {
        // console.log(body);
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
                    // console.log('x ', x);
                    x.siteid = val.id;
                    x.latitude = val.latitude;
                    x.longitude = val.longitude;
                    x.name = val.name;
                });
                // console.log('itemsProcessed = ', itemsProcessed, ' countsArr.length =', countsArr.length);
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

module.exports = router;
