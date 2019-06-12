var express = require('express');
var router = express.Router();
var request = require('request-promise');

const bigbellyhost = process.env.BIGBELLY_CLEAN_API;
const bigbellytoken = process.env.BIGBELLY_TOKEN;
const bigbellytoken = '';

router.get('/', function (req, res, next) {
    res.send('hello bigbelly');
});

router.get('/alerts', function (req, res, next) {
    console.log('inside alerts');
    // valid routes from api docs are:
    // accounts, collectionSummary, assets, alerts, collectionReady
    // use ${req.params.route} if using :route instead of alerts in url
    let mydata = async function getAlerts() {
        let options = {
            url: `${bigbellyhost}/api/v2?objectType=alerts&action=load&accountFilter=388`,
            headers: { 'X-Token': bigbellytoken }
        }
        return await request(options);
    }
    mydata().then((results) => {
        // console.log(results);
        res.send(results);
    }).catch(function (err) {
        console.log('err = ', err);
    });
});

router.get('/assets', function (req, res, next) {
    // valid routes from api docs are:
    // accounts, collectionSummary, assets, alerts, collectionReady
    // use ${req.params.route} if using :route instead of alerts in url
    let mydata = async function getAlerts() {
        let options = {
            url: `${bigbellyhost}/api/v2?objectType=assets&action=load&accountFilter=388`,
            headers: { 'X-Token': bigbellytoken }
        }
        return await request(options);
    }
    mydata().then((results) => {
        // console.log(results);
        res.send(results);
    }).catch(function (err) {
        console.log('err = ', err);
    });
});

module.exports = router;
