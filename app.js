#!/usr/bin/env node
process.env.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR ? process.env.NODE_CONFIG_DIR : __dirname + '/config/';

var jira = require("./lib/jira/jira");
var renderer = require("./lib/renderer");
var _ = require("lodash");
var config = require('config');

const hr = _.repeat('-', process.stdout.columns);


var show = function () {
    jira.getActiveIssues().then(function (issues) {
        renderer.printTasks(issues.issues);
        renderer.printTemplates(config.templates);
    });
};

var update = function (issue, status, comment) {
    jira.updateStatus(issue, status, comment).then(function () {
        console.log("Updated!");
    });
};

var reassign = function (issue, owner) {
    jira.reassign(issue, owner).then(function () {
        console.log("Assigned to %s", owner);
    });
};

var create = function (title, template, estimate) {
    jira.create(title, template, estimate).then(function (ticket) {
        console.log("Ticket %s added to backlog.", ticket.key);
    })
};

var open = function (issue) {
    jira.open(issue);
};

var help = function () {
    console.log('jira create template_name issue_title estimate');
    console.log('  Creates a new issue in backlog');
    console.log('    e.g.: ' + renderer.colorize('jira create care "Short summary of the task', 'green'));
    console.log();
    console.log('jira move issue_id sprint|backlog');
    console.log('  Moves the issue to the current sprint or the backlog');
    console.log('    e.g.: ' + renderer.colorize('jira move QBWG-00000 sprint', 'green'));
    console.log();
    console.log('jira update issue_id open|o|in progress|ip|close|c|blocked|b|integration|i {comment}');
    console.log('  Updates the status of the ticket');
    console.log('    e.g.: ' + renderer.colorize('jira update QBWG-00000 close "Done with coding and testing"', 'green'));
    console.log();
    console.log('jira reassign issue_id new_owner');
    console.log('  Reassigns the ticket to a new owner');
    console.log('    e.g.: ' + renderer.colorize('jira reassign QBWG-00000 rrao2', 'green'));
    console.log();
};

var move = function (issue, destination) {
    jira.move(issue, destination).then(function (res) {
        console.log("Moved issue to %s", destination);
    });
};

var args = process.argv.slice(2);


if (args.length == 0) {
    show();
} else if (args[0] === 'help') {
    help();
}
else if (args[0] === 'create') {
    create(args[1], args[2], args[3]);
}
else if (args[0] === 'move') {
    move(args[1], args[2]);
}
else if (args[0] === 'update') {
    update(args[1], args[2], args[3])
}
else if (args[0] === 'reassign') {
    reassign(args[1], args[2])
}
else if (args[0] === 'open') {
    open(args[1])
}
else {
    console.log("Unrecognized command!")
}
