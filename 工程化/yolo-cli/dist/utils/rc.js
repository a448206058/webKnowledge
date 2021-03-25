"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.remove = exports.set = exports.getAll = exports.get = void 0;

var _constants = require("./constants");

var _ini = require("ini");

var _util = require("util");

var _chalk = _interopRequireDefault(require("chalk"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const exits = (0, _util.promisify)(_fs.default.exists);
const readFile = (0, _util.promisify)(_fs.default.readFile);
const writeFile = (0, _util.promisify)(_fs.default.writeFile); //RC 是配置文件
//DEFAULTS 是默认的配置

const get = async key => {
  const exit = await exits(_constants.RC);
  let opts;

  if (exit) {
    opts = await readFile(_constants.RC, 'utf8');
    opts = (0, _ini.decode)(opts);
    return opts[key];
  }

  return '';
};

exports.get = get;

const getAll = async () => {
  const exit = await exits(_constants.RC);
  let opts;

  if (exit) {
    opts = await readFile(_constants.RC, 'utf8');
    opts = (0, _ini.decode)(opts);
    return opts;
  }

  return {};
};

exports.getAll = getAll;

const set = async (key, value) => {
  const exit = await exits(_constants.RC);
  let opts;

  if (exit) {
    opts = await readFile(_constants.RC, 'utf8');
    opts = (0, _ini.decode)(opts);

    if (!key) {
      console.log(_chalk.default.red(_chalk.default.bold('Error:')), _chalk.default.red('key is required'));
      return;
    }

    if (!value) {
      console.log(_chalk.default.red(_chalk.default.bold('Error:')), _chalk.default.red('value is required'));
      return;
    }

    Object.assign(opts, {
      [key]: value
    });
  } else {
    opts = Object.assign(_constants.DEFAULTS, {
      [key]: value
    });
  }

  await writeFile(_constants.RC, (0, _ini.encode)(opts), 'utf8');
};

exports.set = set;

const remove = async key => {
  const exit = await exits(_constants.RC);
  let opts;

  if (exit) {
    opts = await readFile(_constants.RC, 'utf8');
    opts = (0, _ini.decode)(opts);
    delete opts[key];
    await writeFile(_constants.RC, (0, _ini.encode)(opts), 'utf8');
  }
};

exports.remove = remove;