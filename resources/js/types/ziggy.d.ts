// Ziggy's @routes Blade directive injects a global `route()` function into
// the browser at runtime — it's never imported as a module in any page.
// TypeScript has no way to know it exists without this declaration, which
// is why every route(...) call was showing "Cannot find name 'route'"
// even though the app works fine at runtime.
import { route as routeFn } from 'ziggy-js';

declare global {
    var route: typeof routeFn;
}