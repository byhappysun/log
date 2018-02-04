/**
 * A JavaScript log level module for browser
 */

const levelMap = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5,
    off: 6
};

const console = window.console || { log() { } };

console.fatal = console.fatal || console.error;

const config = {
    // log level
    level: 'debug',
    // log server URI
    logServerUrl: '',
    // which param server-end get the log
    logServerParam:  'msg'
};

function _log(level, msg) {
    if ( (levelMap[window.__log_level || config.level]) <= levelMap[level]) {
        (console[level] || console.log)(msg);
        if (config.logServerUrl) {
            jsonp(
                config.logServerUrl,
                config.logServerParam,
                `[${level}] ${msg}`
            );
        }
    }
}

let jsonpCounter = 0;

function jsonp(url, key, value) {
    const id = `log_jsonp_${jsonpCounter++}`;
    const target = document.head;
    const script = document.createElement('script');
    url += `${/\?/.test(url) ? '&' : '?'}callback=${encodeURIComponent(id)}&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    url = url.replace('?&', '?');

    const timer = setTimeout(() => {
        delete window[id];
        script.parentNode.removeChild(script);
    }, 10000);

    const fn = function(body){
        window.clearTimeout(timer);
        if (false === body.success) {
            console.log('send failed');
        }
        delete window[id];
        script.parentNode.removeChild(script);
    };

    window[id] = fn;

    script.src = url;
    target.appendChild(script);
}

class Log {
    static setConfig(conf = {}) {
        Object.assign(config, conf);
    }
    /**
     * 级别最低，可以用于任何有利于在调试时可详细了解系统运行状态的信息
     * @param {String} msg - 日志详情
     */
    static debug(msg) {
        _log('debug', msg);
    }

    /**
     * 重要，用来反馈当前运行状态
     * @param {String} msg - 日志详情
     */
    static info(msg) {
        _log('info', msg);
    }

    /**
     * 警告，可修复，系统可继续执行下去
     * @param {String} msg - 日志详情
     */
    static warn(msg) {
        _log('warn', msg);
    }

    /**
     * 错误，可修复，但无法确定系统是否能正常运行
     * @param {String} msg - 日志详情
     */
    static error(msg) {
        _log('error', msg);
    }

    /**
     * 严重错误，无法修复，系统继续运行会产生严重后果
     * @param {String} msg - 日志详情
     */
    static fatal(msg) {
        _log('fatal', msg);
    }
}

Log.d = Log.debug;
Log.i = Log.info;
Log.w = Log.warn;
Log.e = Log.error;
Log.f = Log.fatal;

export { Log as log };
