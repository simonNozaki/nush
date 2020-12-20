const log4js = require("log4js");
const logger = log4js.getLogger("nush-server");
logger.level = "info";

module.exports = logger;