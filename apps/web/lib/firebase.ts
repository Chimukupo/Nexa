/**
 * Firebase Client SDK Exports
 * 
 * Re-exports from the refactored Firebase client module.
 * This maintains backward compatibility while using the new structure.
 */

export { app, db, auth, storage, analytics } from "./firebase/client";
export * from "./firebase/collections";

