const TestClass = new Class({
  Extends: mindplot.Events,

  getEvents() {
    return this.$events;
  },

  removeEvents() {
    this.$events = {};
  },
});

// Test class and variables
const expectedChangeFn1 = function () { return 'change1'; };
const expectedChangeFn2 = function () { return 'change2'; };
const expectedLoadFn = function () { return 'loaded'; };
const myTestClass = new TestClass();

describe('Events class suite', () => {
  afterEach(() => {
    myTestClass.removeEvents();
  });

  it('addEventTest', () => {
    expect(myTestClass.getEvents()).toEqual({});
    myTestClass.addEvent('change', expectedChangeFn1);
    expect(myTestClass.getEvents()).toEqual({ change: [expectedChangeFn1] });
    myTestClass.addEvent('change', expectedChangeFn2);
    expect(myTestClass.getEvents()).toEqual({ change: [expectedChangeFn1, expectedChangeFn2] });
    myTestClass.addEvent('load', expectedLoadFn);
    expect(myTestClass.getEvents()).toEqual({ change: [expectedChangeFn1, expectedChangeFn2], load: [expectedLoadFn] });
  });
  it('removeEventTest', () => {
    expect(myTestClass.getEvents()).toEqual({});
    myTestClass.addEvent('change', expectedChangeFn1);
    myTestClass.addEvent('change', expectedChangeFn2);
    expect(myTestClass.getEvents()).toEqual({ change: [expectedChangeFn1, expectedChangeFn2] });
    myTestClass.removeEvent('change', expectedChangeFn1);
    expect(myTestClass.getEvents()).toEqual({ change: [expectedChangeFn2] });
  });
});
