export type Bindings = Env & {
  /** Optional secret. When set, new messages are also posted to this Discord webhook. */
  DISCORD_WEBHOOK_URL?: string;
  /** Optional send_email binding. When bound with CONTACT_FROM, messages are emailed to CONTACT_TO. */
  EMAIL?: SendEmail;
  /** Sender on a domain with Email Routing, for example site@jacobjbeal.com. */
  CONTACT_FROM?: string;
};

export type AppEnv = { Bindings: Bindings };
