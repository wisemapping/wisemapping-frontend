export default class VersionNumber {
  protected version: string;

  constructor(version: string) {
    this.version = version;
  }

  public getVersion(): string {
    return this.version;
  }
}
