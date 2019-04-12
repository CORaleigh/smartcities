var express = require('express');
var router = express.Router();
var Request = require('request');
var rp = require('request-promise');
let pending;

// const pedtoken = process.env.PED_TOKEN;
const pedtoken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3Rva2VuIjoiTUg3Q1ZXM0dRSUIyUSIsImxvZ2luX2NvdW50IjoxMX0.4Dl4bjW4pBi30_zEG_HxHa8gLUKokTe0grDrc0gHw98';
const limehost = "https://web-production.lime.bike/api/rider/v1/views/map?ne_lat=35.909606&ne_lng=-78.4330&sw_lat=35.6695&sw_lng=-78.8201&user_latitude=35.7802&user_longitude=-78.6391&zoom=16'";
const cookie = 'NXY4ZGpBZlRNTWVjTVFnb01ibzFqSE5ncndlWnpwRXZ3Y2lYeUJtdWRFYWV1c0Nsbk11WVRNTGF2b1hmVU5IT1d6ckpvQWVWeFZFM052RklKa2dYV2M4NTdWNmpCVlFqSmxzV1ZoTWNmT2dQeXJQQ1QrbVFzZHdRSUZwT25kbjNrNEtTaThiK0VZbXk3U0lWeEFBSTFhWUVYd0pOazMzRTlxOHFyWHhyWEdpck81cGE4aDB3YUJCMUkvTjdnYjZJcHZ0ZUV0ZHdobGxEdXdScllWT0g4MFNEa0FSM3RLYm9vSEt5Ri9Gd1hJRU1MakZ6MUFIVlRXRXJYR2FRVzBMTkNyK1o4SXlMS1ZVc3pnNy8zUWZtOVpXSm4rUURoUXZ0d1FUbmhCVFQwNTZYVmZVaTREbEFRKzZXNS9EUnVnYlRDNlpKNTBQQkxlNFFwalFsZ3ZHdzdRPT0tLUh6a0kwYlh3UkdtYzBXeGxNYXFOYlE9PQ%3D%3D--59086278d590971da9d5e0297b8444ba14d18d1c';
let mergeObj = [];
let request = rp.defaults({
    headers: {
        'cookie': `_limebike-web_session=${cookie}`,
        'Authorization': `Bearer ${pedtoken}`,
    }
});

/* GET pedsite listing. */
router.get('/', function (req, res, next) {

    // pass yesterday to url for counts
    // let event = new Date();
    // event.setDate(event.getDate() - 1);
    // event = event.toISOString().slice(0, 10);
    // console.log('event  ', event + 'T00:00:00');

    request(`${limehost}`).then(body => {
        console.log(body);
        let siteIds = JSON.parse(body);
        res.send(body);
        // pass each site id to counter service to get counts per site 
        // siteIds.forEach((value) => {
        //     console.log("value id = ", value.id);
        //     request(`${pedhost}/api/1.0/data/site/${value.id}/?begin=${event}&step=day`).then(cnts => {
        //         console.log('cnts = ', cnts);
        //     })
        // });
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
