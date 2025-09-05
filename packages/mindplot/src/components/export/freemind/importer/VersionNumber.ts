export default class VersionNumber {
  protected version: string;

  constructor(version: string) {
    this.version = version;
  }

  public getVersion(): string {
    return this.version;
  }

  public isGreaterThan(versionNumber: VersionNumber): boolean {
    return this.compareTo(versionNumber) < 0;
  }

  public compareTo(otherObject: VersionNumber): number {
    if (this.equals<VersionNumber>(otherObject)) {
      return 0;
    }

    const ownTokinizer = this.getTokinizer();
    const otherTokinizer = otherObject.getTokinizer();

    for (let i = 0; i < ownTokinizer.length; i++) {
      let ownNumber: number;
      let ohterNumber: number;

      try {
        ownNumber = parseInt(ownTokinizer[i], 10);
        ohterNumber = parseInt(otherTokinizer[i], 10);
      } catch {
        return 1;
      }

      if (ownNumber > ohterNumber) {
        return 1;
      }
      if (ownNumber < ohterNumber) {
        return -1;
      }
    }

    return -1;
  }

  public equals<T>(o: T): boolean {
    if (!(o instanceof VersionNumber)) {
      return false;
    }
    const versionNumber: VersionNumber = o as VersionNumber;
    return this.version === versionNumber.version;
  }

  private getTokinizer(): Array<string> {
    return this.getVersion().split('.');
  }
}
