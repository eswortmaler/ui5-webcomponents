import EventProvider from "./EventProvider.js";
import whenDOMReady from "./util/whenDOMReady.js";
import insertFontFace from "./FontFace.js";
import insertSystemCSSVars from "./SystemCSSVars.js";
import { getTheme } from "./config/Theme.js";
import applyTheme from "./theming/applyTheme.js";
import { registerCurrentRuntime } from "./Runtimes.js";
import { getFeature } from "./FeaturesRegistry.js";

let bootPromise;
const eventProvider = new EventProvider();

/**
 * Attach a callback that will be executed on boot
 * @public
 * @param listener
 */
const attachBoot = listener => {
	eventProvider.attachEvent("boot", listener);
};

const boot = async () => {
	if (bootPromise) {
		return bootPromise;
	}

	/* eslint-disable no-alert, no-async-promise-executor */
	/*
		Note(since we disable eslint rule):
		If an async executor function throws an error, the error will be lost and won't cause the newly-constructed Promise to reject.
		This could make it difficult to debug and handle some errors.
	*/
	bootPromise = new Promise(async resolve => {
		registerCurrentRuntime();

		const OpenUI5Support = getFeature("OpenUI5Support");
		const F6Navigation = getFeature("F6Navigation");
		if (OpenUI5Support) {
			await OpenUI5Support.init();
		} else if (F6Navigation) {
			F6Navigation.init();
		}

		await whenDOMReady();
		await applyTheme(getTheme());
		OpenUI5Support && OpenUI5Support.attachListeners();
		insertFontFace();
		insertSystemCSSVars();
		await eventProvider.fireEventAsync("boot");

		resolve();
	});
	/* eslint-enable no-alert, no-async-promise-executor */

	return bootPromise;
};

export {
	boot,
	attachBoot,
};
