var express = require('express');
var router = express.Router();
var Request = require('request');
var rp = require('request-promise');
let pending;

// const pedtoken = process.env.PED_TOKEN;

const pedhost = "https://apieco.eco-counter-tools.com";
let mergeObj = [];
let request = rp.defaults({
    headers: {
        'Authorization': `Bearer ${pedtoken}`
    }
});

/* GET pedsite listing. */
router.get('/', function (req, res, next) {

    // pass yesterday to url for counts
    let event = new Date();
    event.setDate(event.getDate() - 1);
    event = event.toISOString().slice(0, 10);
    console.log('event  ', event + 'T00:00:00');

    request(`${pedhost}/api/1.0/site`).then(body => {
        console.log(body);
        let siteIds = JSON.parse(body);
        // pass each site id to counter service to get counts per site 
        siteIds.forEach((value) => {
            console.log("value id = ", value.id);
            request(`${pedhost}/api/1.0/data/site/${value.id}/?begin=${event}&step=day`).then(cnts => {
                console.log('cnts = ', cnts);
            })
        });
    }).catch(err => {
        console.log(err);
    });

    // request.get('https://apieco.eco-counter-tools.com/api/1.0/site').on('response', function(response) {
    //     console.log(response.statusCode) // 200
    //     console.log(response.headers['content-type']) // 'image/png'
    //   }).pipe(res);

    //   res.send('respond with a pedsite resource');
});

router.get('/test', function (req, res, next) {

    // pass yesterday to url for counts
    let event = new Date();
    event.setDate(event.getDate() - 1);
    event = event.toISOString().slice(0, 10);
    // start at midnight
    event = event + 'T00:00:00';

    // get site id from site url
    request(`${pedhost}/api/1.0/site`).then(body => {
        console.log(body);
        let siteIds = JSON.parse(body);
        pending = siteIds.length; 
        // loop through site ids, pause 2 seconds (for rate limited api constraint)
        // and then get counts per site from count url
        siteIds.forEach((value, i) => {
            let siteCnts = f1(value, i);
            console.log('i = ', typeof(i));
                   
        });

    }).catch(err => {
        console.log(err);
    });


    function resolveAfter2Seconds(siteId, i) {
        return new Promise(resolve => {
            setTimeout(() => {
                pending--; // this helps us keep track of when to send the response to consumer.
                // console.log('inside timeout = ', siteId);
                resolve(siteId);
            }, 6000 * i);
        });
    }

    // https://stackoverflow.com/questions/30676849/delay-between-api-calls-nodejs
    async function f1(siteIds, i) {
        var x = await resolveAfter2Seconds(siteIds.id, i);
        console.log('x = ', siteIds); // 10
        // now that 2 seconds has passed, call the count api
        // console.log('URL is ', `${pedhost}/api/1.0/data/site/${x}?begin=${event}&step=day`)
        request(`${pedhost}/api/1.0/data/site/${x}/?begin=${event}&step=day`).then(cnts => {
            console.log('counts = ', cnts);
            flatten(cnts, siteIds);

        });
    }

    function flatten(cnts, siteIds) {

        let counts = JSON.parse(cnts);
        counts.forEach((cntValue) => {
            mergeObj.push({ "siteId": siteIds.id, "name": siteIds.name, "longitude": siteIds.longitude, "latitude": siteIds.latitude, "pedcnt": cntValue.counts });
        });
        // console.log('mergeObj = ', mergeObj);
        // res.send(mergeObj);
        if (pending == 0){ 
            res.end(JSON.stringify(mergeObj));
            // empty the array
            mergeObj = [];
        }
        return mergeObj;
    }

});

/* GET pedsite listing. */
router.get('/newsite', function (req, res, next) {
    res.send('respond with a newsite resource');
});

module.exports = router;
