const queueithelper = require('../../cartridges/int_queueit_sfra/cartridge/scripts/QueueIt');
const QueueIT = require('../../cartridges/int_queueit_sfra/cartridge/scripts/queueit_knownuserv3_sdk');


jest.mock('dw/object/CustomObjectMgr', () => {}, { virtual: true });
jest.mock('dw/system/Site', () => ({
    getCurrent: () => ({
        getPreferences: () => {
        }
    })
}), { virtual: true });

jest.mock('dw/crypto/Mac', () => function Mac() {
    this.digest = (stringToHash, secretKey) => {
        const crypto = require('crypto');
        return crypto.createHmac('sha256', secretKey)
        .update(stringToHash).digest();
    }
}, { virtual: true });

jest.mock('dw/crypto/Encoding', () => ({
    toHex : buffer => {
        return buffer.toString('hex');
    }
}), { virtual: true });

function nodeJSConfigureKnownUserHashing (secretKey, stringToHash) {
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', secretKey)
        .update(stringToHash)
        .digest('hex');
      return hash;
}

test('adds 1 + 2 to equal 3', () => {
    var utils = QueueIT.KnownUserV3.SDK.Utils;
    expect(utils.generateSHA256Hash('SECRET_KEY', 'SECRET_STRING')).toBe(nodeJSConfigureKnownUserHashing('SECRET_KEY', 'SECRET_STRING'));
});