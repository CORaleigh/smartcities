var express = require('express');
var router = express.Router();
var rp = require('request-promise');

let countsArr = new Array();
let valueidArr = new Array();
let itemsProcessed = 0;
let siteIds;
let event;
let sites = new Object();
let siteNameArr = [];
let goodName;
const pedtoken = process.env.ECOVISIO_TOKEN;
const pedhost = process.env.ECOVISIO_API;
let valueids;
let request = rp.defaults({
	headers: {
		Authorization: `Bearer ${pedtoken}`
	}
});

router.get('/yesterday', function(req, res, next) {
	event = new Date();
	event.setDate(event.getDate() - 1);
	event = event.toISOString().slice(0, 10);
	event = event + 'T00:00:00';

	request(`${pedhost}/api/1.0/site`)
		.then(body => {
			siteIds = JSON.parse(body);
			siteIds.forEach(value => {
				valueidArr.push({ name: value.name, id: value.id });
				value.channels.forEach(channel => {
					channel.sitename = value.name;
					valueidArr.push(channel);
					// valueidArr = {...valueidArr, ...channel};
				});
			});
		})
		.finally(() => {
			valueidArr.forEach(val => {
				itemsProcessed++;
				request(
					`${pedhost}/api/1.0/data/site/${val.id}?begin=${event}&step=day`
				)
					.then(body => {
						valueids = JSON.parse(body);
						valueids.forEach(x => {
							// if (x.status === 0) {
							x.siteid = val.id;
							x.latitude = val.latitude;
							x.longitude = val.longitude;
							x.interval = 'day';
							x.description = val.name;
							x.source = 'Eco-Visio Pedestrian Counter';
							x.countType =
								val.userType === 1
									? 'pedestrian'
									: val.userType === 2
									? 'bicycle'
									: val.userType === 3
									? 'horse'
									: val.userType === 4
									? 'car'
									: val.userType === 5
									? 'bus'
									: val.userType === 6
									? 'minibus'
									: val.userType === 7
									? 'undefined'
									: val.userType === 8
									? 'motocycle'
									: val.userType === 9
									? 'kayak'
									: (x.countType = 'unknown');
						});

						valueids.forEach(fin => {
							// console.log('fin', fin.countType);
							if (fin.countType === 'unknown') {
								goodName = fin.description;
								valueids.splice(fin.length);
							} else {
								fin.description = goodName;
							}
							// fin.countType === 'unknown' ? splice(fin.length) ?
						});

						countsArr.push(valueids);

						if (itemsProcessed === countsArr.length) {
							res.send(JSON.stringify(countsArr));
							countsArr.length = 0;
							valueidArr.length = 0;
							itemsProcessed = 0;
						}
					})
					.catch(err => {
						console.log('the error is ', err);
					});
			});
		})
		.catch(err => {
			console.log(err);
		});
});

router.get('/thisweek', function(req, res, next) {
	function getMonday(d) {
		d = new Date(d);
		var day = d.getDay(),
			diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
		return new Date(d.setDate(diff));
	}

	x = getMonday(new Date());
	x = x.toISOString().slice(0, 10);
	event = x + 'T00:00:00';

	request(`${pedhost}/api/1.0/site`)
		.then(body => {
			siteIds = JSON.parse(body);
			siteIds.forEach(value => {
				valueidArr.push(value);
			});
		})
		.finally(() => {
			valueidArr.forEach(val => {
				itemsProcessed++;
				request(
					`${pedhost}/api/1.0/data/site/${val.id}/?begin=${event}&step=week`
				)
					.then(body => {
						valueids = JSON.parse(body);

						valueids.forEach(x => {
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
					})
					.catch(err => {
						console.log('the error is ', err);
					});
			});
		})
		.catch(err => {
			console.log(err);
		});
});

router.get('/thismonth', function(req, res, next) {
	date = new Date();
	var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
	firstDayOfMonth = firstDayOfMonth.toISOString().slice(0, 10);
	event = firstDayOfMonth + 'T00:00:00';

	request(`${pedhost}/api/1.0/site`)
		.then(body => {
			siteIds = JSON.parse(body);
			siteIds.forEach(value => {
				valueidArr.push(value);
			});
		})
		.finally(() => {
			valueidArr.forEach(val => {
				itemsProcessed++;
				request(
					`${pedhost}/api/1.0/data/site/${val.id}/?begin=${event}&step=month`
				)
					.then(body => {
						valueids = JSON.parse(body);

						valueids.forEach(x => {
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
					})
					.catch(err => {
						console.log('the error is ', err);
					});
			});
		})
		.catch(err => {
			console.log(err);
		});
});

router.get('/thisyear', function(req, res, next) {
	event = new Date();
	event.setDate(event.getDate());
	thisyear = event.getFullYear();
	event = event.toISOString().slice(0, 10);
	beginningOfYear = thisyear + '-01-01T00:00:00';
	event = beginningOfYear;

	request(`${pedhost}/api/1.0/site`)
		.then(body => {
			siteIds = JSON.parse(body);
			siteIds.forEach(value => {
				valueidArr.push(value);
			});
		})
		.finally(() => {
			valueidArr.forEach(val => {
				itemsProcessed++;
				request(
					`${pedhost}/api/1.0/data/site/${val.id}/?begin=${event}&step=year`
				)
					.then(body => {
						valueids = JSON.parse(body);
						valueids.forEach(x => {
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
					})
					.catch(err => {
						console.log('the error is ', err);
					});
			});
		})
		.catch(err => {
			console.log(err);
		});
});

module.exports = router;
