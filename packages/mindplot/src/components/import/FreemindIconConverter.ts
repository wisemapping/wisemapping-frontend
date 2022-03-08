import IconModel from '../model/IconModel';

export default class FreemindIconConverter {
  private static freeIdToIcon: Map<string, IconModel> = new Map<string, IconModel>();

  public static toWiseId(iconId: string): number | null {
    const result: IconModel = this.freeIdToIcon.get(iconId);
    return result ? result.getId() : null;
  }
}
