/** biome-ignore-all lint/suspicious/noExplicitAny: Will explain later */
class ValidationError extends Error {
  issues;
  constructor(issues: any[]) {
    super("Validation error");
    this.issues = issues;
  }
}

export default ValidationError;
