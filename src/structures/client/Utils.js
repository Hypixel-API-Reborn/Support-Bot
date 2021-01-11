class Utils {
  isArrayOfStrings (arr) { const res = []; for (let i = 0; i < arr.length; i++) { if (typeof arr[i] !== 'string') { res.push(false); continue; } res.push(true); } return !res.includes(false); }
  getFromObject (obj, path) { const ar = path.split('.'); let o = obj; for (let i = 0; i < ar.length; i++) { if (!o[ar[i]]) { return undefined; } o = o[ar[i]]; } return o; }
}
module.exports = Utils;
