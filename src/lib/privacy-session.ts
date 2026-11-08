export type PrivacyChoices = { usage: boolean; cloud: boolean };
export type PrivacyState = PrivacyChoices & {
  saved: boolean;
  capabilities: PrivacyChoices;
  cloudToken: string | null;
};

export const disabledPrivacyState: PrivacyState = {
  usage: false,
  cloud: false,
  saved: false,
  capabilities: { usage: false, cloud: false },
  cloudToken: null,
};

function validState(value: unknown): value is PrivacyState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<PrivacyState>;
  return (
    typeof state.saved === "boolean" &&
    typeof state.usage === "boolean" &&
    typeof state.cloud === "boolean" &&
    typeof state.capabilities?.usage === "boolean" &&
    typeof state.capabilities?.cloud === "boolean" &&
    (!state.usage || state.capabilities.usage) &&
    (!state.cloud || state.capabilities.cloud) &&
    (state.cloudToken === null ||
      (typeof state.cloudToken === "string" && /^[a-f0-9]{32}$/.test(state.cloudToken))) &&
    (!state.cloud || state.cloudToken !== null)
  );
}

export function createPrivacySession({
  request,
  update,
  unavailable,
  reload,
  integration,
}: {
  request: (choices?: PrivacyChoices) => Promise<unknown>;
  update: (state: PrivacyState) => void;
  unavailable: () => void;
  reload: () => void;
  integration: { token: string | null };
}) {
  let generation = 0;
  let saving = false;
  let reloading = false;
  let state = disabledPrivacyState;

  function apply(next: PrivacyState) {
    state = next;
    update(next);
    // Removing an executed script cannot unregister the beacon's listeners.
    if (integration.token && (!next.cloud || next.cloudToken !== integration.token) && !reloading) {
      reloading = true;
      reload();
    }
  }

  async function synchronize(choices?: PrivacyChoices): Promise<PrivacyState | null> {
    if (saving || reloading) return null;
    const version = ++generation;
    saving = choices !== undefined;
    // Keep an installed beacon stable while pausing first-party collection immediately.
    update({ ...state, usage: false });
    try {
      const next = await request(choices);
      if (version !== generation) return null;
      if (!validState(next)) throw new Error("Invalid privacy state");
      apply(next);
      return next;
    } catch {
      if (version === generation) {
        apply(disabledPrivacyState);
        unavailable();
      }
      return null;
    } finally {
      if (version === generation) saving = false;
    }
  }

  return {
    read: () => synchronize(),
    save: (choices: PrivacyChoices) => synchronize(choices),
    startCloud(token: string): boolean {
      if (!state.cloud || state.cloudToken !== token || integration.token || reloading)
        return false;
      integration.token = token;
      return true;
    },
    cancel() {
      generation++;
      saving = false;
    },
  };
}
