const buf = new Uint8Array(1000000); // 1MB
try {
  String.fromCharCode(...buf);
  console.log("Success");
} catch (e) {
  console.error("Error:", e.message);
}
