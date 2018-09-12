"use strict";

var rp = require('request-promise');
var config = require('config');
var _ = require("lodash");
var exec = require('child_process').exec;

var getActiveIssues = function () {
    var query = {
        "startAt": 0,
        "fields": ["id", "key", "summary", "status", "customfield_11703"]
    };
    query.jql = config.get("jql");
    var options = prepareOptions();
    options.uri = config.get("url") + "/rest/api/2/search";
    options.body = query;
    options.method = "POST";
    return rp(options);
};

var getIssue = function (id) {
    var options = prepareOptions();
    options.uri = config.get("url") + "/rest/api/2/issue/" + id;
    options.method = "GET";
    return rp(options);
};


var updateStatus = function (issue, status, comment) {
    var body = {
        "update": {
            "comment": [{"add": {"body": "Updated from CLI"}}]
        },
        "transition": {}
    };
    if (status === 'closed' || status === 'c' || status === 'close') {
        body.update.fixVersions = [{"set": [{"name": config.get("fixVersion")}]}];
    }
    body.transition.id = config.get("transitions")[_.toLower(status)];
    if (comment) {
        body.update.comment[0].add.body = comment;
    }
    var options = prepareOptions();
    options.uri = config.get("url") + "/rest/api/2/issue/" + issue + "/transitions";
    options.body = body;
    options.method = "POST";
    return rp(options);
};

var reassign = function (issue, owner) {
    var body = {"fields": {"assignee": {"name": owner}}};
    var options = prepareOptions();
    options.uri = config.get("url") + "/rest/api/2/issue/" + issue;
    options.body = body;
    options.method = "PUT";
    return rp(options);
};

var create = function (template, title, estimate) {
    var templateTicket = config.get("templates")[template];
    if (!templateTicket) {
        console.log("No template found for %s", template);
        return;
    }
    console.log(estimate)
    return getIssue(templateTicket).then(function (ticket) {
        var body = {
            "fields": {
                "project": {
                    "key": ticket.fields.project.key
                },
                "labels": ticket.fields.labels,
                "components": ticket.fields.components,
                "summary": title,
                "description": title,
                "issuetype": {
                    "name": "Story"
                },
                "assignee": {
                    "name": config.user
                },
                "reporter": {
                    "name": config.user
                },
                "customfield_13505": ticket.fields.customfield_13505,
                "customfield_17002": ticket.fields.customfield_17002,
                "customfield_12002": ticket.fields.customfield_12002,
                "customfield_11703": parseInt(estimate)
            }
        };
        var options = prepareOptions();
        options.uri = config.get("url") + "/rest/api/2/issue";
        options.body = body;
        options.method = "POST";
        return rp(options);
    });


};

var move = function (issue, destination) {
    var body = {"issues": [issue]};
    var options = prepareOptions();
    options.body = body;
    options.method = "POST";

    if (destination === 'backlog') {
        console.log('Moving %s to backlog...', issue);
        options.uri = config.get("url") + "/rest/agile/1.0/backlog/issue";
        return rp(options);
    } else if (destination === 'current' || destination === 'sprint') {
        console.log('Moving %s to current sprint...', issue);
        return getSprint().then(function (sprint) {
            options.uri = config.get("url") + "/rest/agile/1.0/sprint/" + sprint.values[0].id + "/issue ";
            return rp(options);
        });
    } else {
        throw new Error("Invalid Destination");
    }
};

var getSprint = function () {
    var options = prepareOptions();
    options.uri = config.get("url") + "/rest/agile/1.0/board?maxResults=1&name=" + config.boardName;
    options.method = "GET";
    return rp(options).then(function (board) {
        options.uri = config.get("url") + "/rest/agile/1.0/board/" + board.values[0].id + "/sprint?state=active&maxResults=1";
        return rp(options);
    });
};

var open = function (issue) {
    console.log(config.uiLaunchCommand.replace('${issue}', issue))
    exec(config.uiLaunchCommand.replace('${issue}', issue));
};

var prepareOptions = function () {
    var auth = "Basic " + new Buffer(config.get("user") + ":" + config.get("pwd")).toString("base64");
    return {
        json: true,
        headers: {
            "Authorization": auth
        }
    };
};

module.exports.getIssue = getIssue;
module.exports.getActiveIssues = getActiveIssues;
module.exports.getSprint = getSprint;
module.exports.updateStatus = updateStatus;
module.exports.create = create;
module.exports.move = move;
module.exports.reassign = reassign;
module.exports.open = open;


// getSprint().then(function (sprint) {
//     console.log(sprint);
// });