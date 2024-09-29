function getElsByIds(ids) {
  let out = {};
  if (typeof ids === "string") {
    out[ids] = document.getElementById(ids);
  } else if (Array.isArray(ids)) {
    const elmap = new Map();
    for (const id of ids) {
      out[id] = document.getElementById(id);
    }
  }
  return out;
}

export { getElsByIds };
