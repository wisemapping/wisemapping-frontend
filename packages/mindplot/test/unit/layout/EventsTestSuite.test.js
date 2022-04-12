import Events from '../../../src/components/Events';

describe('Events class suite', () => {
  class TestClass extends Events {
    getEvents() {
      return this._handlerByType;
    }

    removeEvents() {
      this._handlerByType = {};
    }
  }

  const expectedChangeFn1 = () => 'change1';
  const expectedChangeFn2 = () => 'change2';
  const expectedLoadFn = () => 'loaded';
  const myTestClass = new TestClass();

  describe('addEventTest', () => {
    afterAll(() => {
      myTestClass.removeEvents();
    });

    test('Added event Change', () => {
      expect(myTestClass.getEvents()).toEqual({});
      myTestClass.addEvent('change', expectedChangeFn1);
    });

    test('Added event Change', () => {
      expect(myTestClass.getEvents()).toEqual({ change: [expectedChangeFn1] });
      myTestClass.addEvent('change', expectedChangeFn2);
    });

    test('Added event Load', () => {
      expect(myTestClass.getEvents()).toEqual({ change: [expectedChangeFn1, expectedChangeFn2] });
      myTestClass.addEvent('load', expectedLoadFn);
      expect(myTestClass.getEvents()).toEqual({
        change: [expectedChangeFn1, expectedChangeFn2],
        load: [expectedLoadFn],
      });
    });
  });

  describe('removeEventTest', () => {
    afterAll(() => {
      myTestClass.removeEvents();
    });

    test('Added 2 event change', () => {
      expect(myTestClass.getEvents()).toEqual({});
      myTestClass.addEvent('change', expectedChangeFn1);
      myTestClass.addEvent('change', expectedChangeFn2);
    });

    test('Remove 1 event change', () => {
      expect(myTestClass.getEvents()).toEqual({ change: [expectedChangeFn1, expectedChangeFn2] });
      myTestClass.removeEvent('change', expectedChangeFn1);
      expect(myTestClass.getEvents()).toEqual({ change: [expectedChangeFn2] });
    });
  });
});
