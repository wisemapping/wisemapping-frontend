export default class Parameters {
  protected REMINDUSERAT: number | undefined;

  getReminduserat(): number | undefined {
    return this.REMINDUSERAT;
  }

  setReminduserat(value: number): void {
    this.REMINDUSERAT = value;
  }
}
