const dependencies = ["axios", "node-ical"];

try {
  dependencies.forEach((dependency) => {
    require(dependency);
    console.log(dependency + " OK");
  });
} catch (error) {
  console.error("Smoke test failed:", error && error.message ? error.message : error);
  process.exit(2);
}
