// Humble
// Author: Triflare
// Initialized by npm run init

/**
 * Blank starter template.
 *
 * Usage example:
 * - Add a block object in getInfo().blocks.
 * - Add the matching method on the class.
 */
/* global Scratch */
class TurboWarpExtension {
  getInfo() {
    return {
      id: "tfHumble",
      name: Scratch.translate("Humble"),
      blocks: [],
    };
  }
}

Scratch.extensions.register(new TurboWarpExtension());
