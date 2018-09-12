var _ = require("lodash");
const hr = _.repeat('-', process.stdout.columns);

var printTasks = function (issues) {
  const header = ' JIRA ID   |  Status     | Points  | Summary ';
  console.log(hr);
  console.log(header);
  console.log(hr);
  var available = process.stdout.columns - header.length
      - ' QBWG-54404 '.length;
  for (var i in issues) {
    var issue = issues[i];
    console.log('%s  | %s | %s | %s ', issue.key, trimTo(
        colorizeOnState(issue.fields.status.name, issue.fields.status.name),
        20),
        trimTo(issue.fields.customfield_11703, 7),
        trimTo(issue.fields.summary, available, 100));
  }
  console.log(hr);
};
var printTemplates = function (templates) {
  console.log('Following JIRA issue templates are available in config:');
  var templates = _.join(_.keysIn(templates), ', ');
  console.log('\t' + templates);
  console.log(hr);
};

var colorizeOnState = function (text, state) {
  if (state.indexOf('Closed') > -1) {
    return '\x1b[32m' + text + '\x1b[0m';
  } else if (state.indexOf('In Progress') > -1) {
    return '\x1b[36m' + text + '\x1b[0m';
  } else if (state.indexOf('Open') > -1) {
    return '\x1b[33m' + text + '\x1b[0m';
  } else if (state.indexOf('Integration') > -1) {
    return '\x1b[34m' + text + '\x1b[0m';
  } else {
    return text;
  }
};

var colorize = function (text, color) {
  if (color === 'green') {
    return '\x1b[32m' + text + '\x1b[0m';
  } else if (color === 'blue') {
    return '\x1b[36m' + text + '\x1b[0m';
  } else if (color === 'yellow') {
    return '\x1b[33m' + text + '\x1b[0m';
  } else {
    return text;
  }
};

var trimTo = function (s, l, p) {
  if (p) {
    l = Math.floor((p / 100) * l);
  }
  return _.padEnd(_.truncate(s, {
    'length': l
  }), l);
}

module.exports.printTasks = printTasks;
module.exports.colorize = colorize;
module.exports.printTemplates = printTemplates;