/**
 * Create a keyed entity class.
 * @param {function} config
 * @param {object} [proto]
 * @returns {function}
 */
function keyed(config, proto) {
    var entities = {};

    if (proto) {
        Keyed.prototype = Object.create(proto);
        Keyed.prototype.constructor = Keyed;
    }

    function Keyed(key) {
        var args = Array.prototype.slice.call(arguments, 1),
            entity;

        if (key in entities) {
            entity = entities[key];
        } else {
            entity = Object.create(Keyed.prototype);
            entities[key] = entity;

            Object.defineProperty(entity, "key", {
                configurable: false,
                enumerable: true,
                writable: false,
                value: String(key)
            });
        }

        config.apply(entity, args);
        return entity;
    }

    /**
     * Select keyed entities.  New entities may be created to fulfill the
     * request if the key is unknown.
     * @param {string[]} keys
     * @returns {Set<Contact>}
     */
    Keyed.select = function(keys) {
        return keys.map(k => entities[k] || Keyed(k));
    };

    /**
     * Return true if the key has been loaded.
     * @param {string} key
     * @returns {boolean}
     */
    Keyed.loaded = function(key) {
        return key in entities;
    };

    /**
     * Assign value to a key.
     * @param {string} key
     * @param {Keyed} value
     */
    Keyed.assign = function(key, value) {
        if (Keyed.loaded(key)) Keyed(key).purge();
        entities[key] = value;
    };

    /**
     * @name Keyed#key
     * @type {string}
     * @readonly
     */
    Keyed.prototype.key = "";

    /**
     * Purge the entity from the entity cache.
     */
    Keyed.prototype.purge = function() {
        if (entities[this.key] === this) delete entities[this.key];
        Object.freeze(this);
    };

    return Keyed;
}

module.exports = keyed;
