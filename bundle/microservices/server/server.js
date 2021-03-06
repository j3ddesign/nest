"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_service_1 = require("@nestjs/common/services/logger.service");
const rxjs_1 = require("rxjs");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const operators_1 = require("rxjs/operators");
const missing_dependency_exception_1 = require("@nestjs/core/errors/exceptions/missing-dependency.exception");
class Server {
    constructor() {
        this.messageHandlers = {};
        this.logger = new logger_service_1.Logger(Server.name);
    }
    getHandlers() {
        return this.messageHandlers;
    }
    getHandlerByPattern(pattern) {
        return this.messageHandlers[pattern] ? this.messageHandlers[pattern] : null;
    }
    add(pattern, callback) {
        this.messageHandlers[JSON.stringify(pattern)] = callback;
    }
    send(stream$, respond) {
        return stream$
            .pipe(operators_1.catchError(err => {
            respond({ err, response: null });
            return rxjs_1.EMPTY;
        }), operators_1.finalize(() => respond({ isDisposed: true })))
            .subscribe(response => respond({ err: null, response }));
    }
    transformToObservable(resultOrDeffered) {
        if (resultOrDeffered instanceof Promise) {
            return rxjs_1.from(resultOrDeffered);
        }
        else if (!(resultOrDeffered && shared_utils_1.isFunction(resultOrDeffered.subscribe))) {
            return rxjs_1.of(resultOrDeffered);
        }
        return resultOrDeffered;
    }
    getOptionsProp(obj, prop, defaultValue = undefined) {
        return obj && obj.options ? obj.options[prop] : defaultValue;
    }
    handleError(error) {
        this.logger.error(error);
    }
    loadPackage(name, ctx) {
        try {
            return require(name);
        }
        catch (e) {
            throw new missing_dependency_exception_1.MissingRequiredDependencyException(name, ctx);
        }
    }
}
exports.Server = Server;
