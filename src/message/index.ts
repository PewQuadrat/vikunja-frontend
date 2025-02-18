import {i18n} from '@/i18n'
import { notify } from '@kyvg/vue3-notification'

export const getErrorText = (r) => {

	if (r.response && r.response.data) {
		if(r.response.data.code) {
			const path = `error.${r.response.data.code}`
			const message = i18n.global.t(path)

			// If message and path are equal no translation exists for that error code
			if (path !== message) {
				return [
					r.message,
					message,
				]
			}
		}

		if (r.response.data.message) {
			return [
				r.message,
				r.response.data.message,
			]
		}
	}

	return [r.message]
}

export function error(e, actions = []) {
	notify({
		type: 'error',
		title: i18n.global.t('error.error'),
		text: getErrorText(e),
		actions: actions,
	})
}

export function success(e, actions = []) {
	notify({
		type: 'success',
		title: i18n.global.t('error.success'),
		text: getErrorText(e),
		data: {
			actions: actions,
		},
	})
}