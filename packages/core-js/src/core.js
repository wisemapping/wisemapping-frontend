import * as Functions from './Functions';
import * as Util from './Utils';

export const Function = Functions;
export const Utils = Util;

function coreJs() {
    global.core = {
        Function,
        Utils
    };
    Math.sign = Function.sign;
    global.$assert = Function.$assert;
    global.$defined = Function.$defined;
    return global.core;
}

export default coreJs;
