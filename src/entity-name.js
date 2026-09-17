// hass.formatEntityName only accepts a card's `name` option (a user string, a
// structured name, or undefined) from HA 2026.4. Earlier versions expose the
// same helper with an incompatible signature, so feature detection is not
// enough - the version has to be checked.
const supportsEntityNames = (hass) => {
  // A hass can report a recent version without carrying the helper (a test
  // harness, or a hass that has not finished initialising), and calling it
  // then throws - so the version gate alone is not enough.
  if (!hass || typeof hass.formatEntityName !== 'function') return false;
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
  // A configured empty name has always meant "use Home Assistant's name", but
  // formatEntityName returns any string verbatim - including the empty one, which
  // would blank the label. Normalise it to undefined so the formatter composes.
  if (name === '') name = undefined;

  if (typeof name === "string") return name;
  if (!stateObj) return undefined;
  if (supportsEntityNames(hass)) {
    return hass.formatEntityName(stateObj, name);
  }
  return stateObj.attributes && stateObj.attributes.friendly_name;
}
