import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createPrivacySession,
  disabledPrivacyState,
  type PrivacyChoices,
  type PrivacyState,
} from "../src/lib/privacy-session.ts";

const token = "a".repeat(32);
const allowed: PrivacyState = {
  saved: true,
  usage: true,
  cloud: true,
  capabilities: { usage: true, cloud: true },
  cloudToken: token,
};
const rejected: PrivacyState = { ...allowed, usage: false, cloud: false, cloudToken: null };

function deferred() {
  let resolve!: (value: unknown) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<unknown>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function fixture(integration = { token: null as string | null }) {
  const requests: { choices?: PrivacyChoices; response: ReturnType<typeof deferred> }[] = [];
  const updates: PrivacyState[] = [];
  let reloads = 0;
  let errors = 0;
  const session = createPrivacySession({
    request(choices) {
      const response = deferred();
      requests.push({ choices, response });
      return response.promise;
    },
    update: (state) => updates.push(state),
    unavailable: () => {
      errors++;
    },
    reload: () => {
      reloads++;
    },
    integration,
  });
  return {
    session,
    requests,
    updates,
    integration,
    get reloads() {
      return reloads;
    },
    get errors() {
      return errors;
    },
  };
}

async function allow(f: ReturnType<typeof fixture>) {
  const pending = f.session.read();
  f.requests.at(-1)!.response.resolve(allowed);
  await pending;
}

test("unchanged privacy refresh pauses usage without reinstalling the beacon", async () => {
  const f = fixture();
  await allow(f);
  assert.equal(f.session.startCloud(token), true);
  const refresh = f.session.read();
  assert.equal(f.updates.at(-1)!.usage, false);
  assert.equal(f.updates.at(-1)!.cloud, true);
  f.requests.at(-1)!.response.resolve(allowed);
  await refresh;
  assert.equal(f.updates.at(-1)!.usage, true);
  assert.equal(f.session.startCloud(token), false);
  assert.equal(f.reloads, 0);
});

test("withdrawal observed through a cross-tab refresh reloads an initialized beacon", async () => {
  const f = fixture();
  await allow(f);
  f.session.startCloud(token);
  const refresh = f.session.read();
  f.requests.at(-1)!.response.resolve(rejected);
  await refresh;
  assert.equal(f.updates.at(-1)!.cloud, false);
  assert.equal(f.reloads, 1);
  assert.equal(f.session.startCloud(token), false);
});

test("a delayed state response cannot restore consent after a withdrawal save", async () => {
  const f = fixture();
  await allow(f);
  const refresh = f.session.read();
  const stale = f.requests.at(-1)!.response;
  const saving = f.session.save({ usage: false, cloud: false });
  assert.deepEqual(f.requests.at(-1)!.choices, { usage: false, cloud: false });
  assert.equal(await f.session.read(), null, "refresh must not overtake a pending save");
  assert.equal(f.requests.length, 3);
  f.requests.at(-1)!.response.resolve(rejected);
  await saving;
  stale.resolve(allowed);
  assert.equal(await refresh, null);
  assert.deepEqual(f.updates.at(-1), rejected);
  assert.equal(f.session.startCloud(token), false);
  assert.equal(f.reloads, 0, "no reload is needed when no beacon was initialized");
});

test("a failed refresh disables collection and ends an existing beacon", async () => {
  const f = fixture();
  await allow(f);
  f.session.startCloud(token);
  const refresh = f.session.read();
  f.requests.at(-1)!.response.reject(new Error("Network unavailable"));
  await refresh;
  assert.deepEqual(f.updates.at(-1), disabledPrivacyState);
  assert.equal(f.errors, 1);
  assert.equal(f.reloads, 1);
});

test("newest refresh wins and cancelled requests cannot publish state", async () => {
  const f = fixture();
  const older = f.session.read();
  const newer = f.session.read();
  f.requests[1].response.resolve(rejected);
  await newer;
  f.requests[0].response.resolve(allowed);
  assert.equal(await older, null);
  assert.deepEqual(f.updates.at(-1), rejected);
  const cancelled = f.session.read();
  const count = f.updates.length;
  f.session.cancel();
  f.requests.at(-1)!.response.resolve(allowed);
  await cancelled;
  assert.equal(f.updates.length, count);
});

test("a remounted control still revokes the document's existing beacon", async () => {
  const f = fixture({ token });
  const pending = f.session.read();
  f.requests[0].response.resolve(rejected);
  await pending;
  assert.equal(f.reloads, 1);
});

test("malformed privacy responses fail closed", async () => {
  const f = fixture();
  const pending = f.session.read();
  f.requests[0].response.resolve({ ...allowed, cloudToken: null });
  await pending;
  assert.deepEqual(f.updates.at(-1), disabledPrivacyState);
  assert.equal(f.errors, 1);
  assert.equal(f.reloads, 0);
});
