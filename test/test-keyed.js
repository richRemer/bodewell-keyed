var expect = require("expect.js"),
    sinon = require("sinon"),
    keyed = require("..");

describe("keyed(function)", () => {
    it("should return constructor", () => {
        var Type = keyed(() => {});
        expect(Type).to.be.a("function");
        expect(new Type()).to.be.a(Type);
    });
});

describe("Keyed(string, object)", () => {
    it("should work without new keyword", () => {
        var Type = keyed(() => {});
        expect(new Type("foo")).to.be.a(Type);
        expect(Type("bar")).to.be.a(Type);
    });

    it("should pass extra args to config function during construction", () => {
        var config = sinon.spy(),
            Type = keyed(config),
            opts = {};

        Type("foo", opts);
        expect(config.calledOnce).to.be(true);
        expect(config.calledWith("foo")).to.be(false);
        expect(config.calledWith(opts)).to.be(true);
    });

    describe("#key", () => {
        it("should be initialized during construction", () => {
            var Type = keyed(() => {});
            expect(Type("foo").key).to.be("foo");
        });

        it("should be immutable", () => {
            var Type = keyed(() => {}),
                foo = Type("foo");

            expect(foo.key).to.be("foo");
        });

        it("should be used to return existing instance", () => {
            var Type = keyed(() => {}),
                foo = Type("foo");

            expect(foo).to.be.a(Type);
            expect(Type("foo")).to.be(foo);
        });
    });

    it("should reconfigure existing instance", () => {
        var Type = keyed(function(val) {
                this.value = val;
            });

        foo = Type("foo", 42);
        Type("foo", 13);
        expect(foo.value).to.be(13);
    });

    describe(".select(string[])", () => {
        it("should return array of Keyed instances", () => {
            var Type = keyed(() => {}),
                foo = Type("foo"),
                bar = Type("bar"),
                baz = Type("baz"),
                selected = Type.select(["foo", "bar"]);

            expect(selected).to.be.an("array");
            expect(selected.length).to.be(2);
            expect(~selected.indexOf(foo)).to.be.ok();
            expect(~selected.indexOf(bar)).to.be.ok();
        });

        it("should create new instances as needed", () => {
            var Type = keyed(() => {}),
                selected = Type.select(["foo"]);

            expect(selected.length).to.be(1);
            expect(selected[0]).to.be.a(Type);
            expect(selected[0].key).to.be("foo");
        });
    });

    describe("#purge()", () => {
        it("should free instance key for re-use by another instance", () => {
            var Type = keyed(() => {}),
                foo = Type("foo");

            foo.purge();
            expect(Type("foo")).to.not.be(foo);
        });

        it("should dissuade further use by locking instance", () => {
            var Type = keyed(() => {}),
                foo = Type("foo");

            foo.purge();
            expect(Object.isFrozen(foo)).to.be(true);
        });
    });
});
