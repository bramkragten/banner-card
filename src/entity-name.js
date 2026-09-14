// hass.formatEntityName only accepts a card's `name` option (a user string, a
// structured name, or undefined) from HA 2026.4. Earlier versions expose the
// same helper with an incompatible signature, so feature detection is not
// enough - the version has to be checked.
const supportsEntityNames = (hass) => {
  const version = hass && hass.config && hass.config.version;
  if (!version) return false;
  const [major, minor] = version.split(".", 2);
  return Number(major) > 2026 || (Number(major) === 2026 && Number(minor) >= 4);
};

// Resolves a `name` option against the entity's registry context (entity,
// device, area, floor). Falls back to the friendly name on older HA versions,
// where a structured name cannot be resolved.
export function computeEntityName(hass, stateObj, name) {
  // A string name is the override, exactly as formatEntityName treats it.
  if (typeof name === "string") return name;
  if (!stateObj) return undefined;
  if (supportsEntityNames(hass)) {
    return hass.formatEntityName(stateObj, name);
  }
  return stateObj.attributes && stateObj.attributes.friendly_name;
}
