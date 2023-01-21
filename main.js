if (import.meta.env.DEV) {
  await import("./owncomponents/devel_loader.ts");
} else {
  await import("./owncomponents/loader.ts");
}

console.log("Main.js");
