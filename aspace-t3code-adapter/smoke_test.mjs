// Smoke test for the A'Space t3code adapter (D-N048 V3b, H-M3 smoke leg).
// Runs only talk-only commands against the built `t3` CLI, with telemetry
// forced off and a scratch T3 home. Never starts the server.
import * as NodeTest from "node:test";
import * as NodeAssert from "node:assert/strict";
import * as NodeChildProcess from "node:child_process";
import * as NodeFSP from "node:fs/promises";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";
import * as NodeUtil from "node:util";

const run = NodeUtil.promisify(NodeChildProcess.execFile);
const REPO = new URL("..", import.meta.url).pathname;
const BIN = NodePath.join(REPO, "apps/server/dist/bin.mjs");
const CONTRACT = JSON.parse(
  await NodeFSP.readFile(new URL("./contract.json", import.meta.url), "utf-8"),
);

const BASE_ENV = {
  ...process.env,
  T3CODE_TELEMETRY_ENABLED: "false",
  T3CODE_POSTHOG_KEY: "",
  T3CODE_POSTHOG_HOST: "",
};

async function t3(args, extraEnv = {}) {
  const home = await NodeFSP.mkdtemp(NodePath.join(NodeOS.tmpdir(), "aspace-t3code-home-"));
  return run(process.execPath, [BIN, ...args], {
    env: { ...BASE_ENV, ...extraEnv, T3CODE_HOME: home },
    timeout: 120_000,
    maxBuffer: 4 * 1024 * 1024,
    input: "",
  });
}

NodeTest.test("contract pins the gel", () => {
  NodeAssert.equal(
    CONTRACT.adapter.pinned_t3code_commit,
    "dc7270581800518b9d7d4db6c8e13852067c8c2d",
  );
  NodeAssert.equal(CONTRACT.adapter.pinned_t3code_version, "0.1.7");
  NodeAssert.equal(CONTRACT.adapter.fork, "Amdkn/t3code");
});

NodeTest.test("--version prints 0.1.7", async () => {
  const { stdout } = await t3(["--version"]);
  NodeAssert.match(stdout, /0\.1\.7/);
});

NodeTest.test("--help prints the CLI help", async () => {
  const { stdout } = await t3(["--help"]);
  NodeAssert.match(stdout, /Run T3 Code|t3/i);
});

NodeTest.test("help subcommand prints the CLI help", async () => {
  const { stdout } = await t3(["help"]);
  NodeAssert.match(stdout, /Run T3 Code|t3/i);
});

NodeTest.test("doctor --help prints the doctor help without touching any database", async () => {
  const { stdout } = await t3(["doctor", "--help"]);
  NodeAssert.match(stdout, /doctor|Database/i);
});

NodeTest.test("--help runs with no network interface (unshare -n, when available)", async () => {
  try {
    await run("which", ["unshare"]);
  } catch {
    console.log("skip: unshare not available");
    return;
  }
  const home = await NodeFSP.mkdtemp(NodePath.join(NodeOS.tmpdir(), "aspace-t3code-home-"));
  const { stdout } = await run("unshare", ["-n", process.execPath, BIN, "--help"], {
    env: { ...BASE_ENV, T3CODE_HOME: home },
    timeout: 120_000,
    maxBuffer: 4 * 1024 * 1024,
    input: "",
  });
  NodeAssert.match(stdout, /Run T3 Code|t3/i);
});
