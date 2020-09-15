import * as Sentry from "@sentry/electron";

Sentry.init({
	dsn: "https://51f7c29baa594b0a8bfa788113e696ce@o266736.ingest.sentry.io/5427751",
    release: 'unigrid-electron@' + process.env.npm_package_version,
    debug: true
});