// A missing setting stops the run with its name; a smoke test is never skipped for lack of data.
export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value === '') {
    throw new Error(`Set ${name} in the shell or in the local smoke settings file.`);
  }
  return value;
}
