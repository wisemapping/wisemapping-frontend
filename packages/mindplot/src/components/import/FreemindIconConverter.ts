import SvgIconModel from '../model/SvgIconModel';

export default class FreemindIconConverter {
  private static freeIdToIcon: Map<string, SvgIconModel> = new Map<string, SvgIconModel>();

  public static toWiseId(iconId: string): number | null {
    const result: SvgIconModel = this.freeIdToIcon.get(iconId);
    return result ? result.getId() : null;
  }
}
