<template>
	<card :title="$t('user.settings.totp.title')" v-if="totpEnabled">
		<x-button
			:loading="totpService.loading"
			@click="totpEnroll()"
			v-if="!totpEnrolled && totp.secret === ''">
			{{ $t('user.settings.totp.enroll') }}
		</x-button>
		<template v-else-if="totp.secret !== '' && !totp.enabled">
			<p>
				{{ $t('user.settings.totp.finishSetupPart1') }}
				<strong>{{ totp.secret }}</strong><br/>
				{{ $t('user.settings.totp.finishSetupPart2') }}
			</p>
			<p>
				{{ $t('user.settings.totp.scanQR') }}<br/>
				<img :src="totpQR" alt=""/>
			</p>
			<div class="field">
				<label class="label" for="totpConfirmPasscode">{{ $t('user.settings.totp.passcode') }}</label>
				<div class="control">
					<input
						autocomplete="one-time-code"
						@keyup.enter="totpConfirm"
						class="input"
						id="totpConfirmPasscode"
						:placeholder="$t('user.settings.totp.passcodePlaceholder')"
						type="text"
						inputmode="numeric"
						v-model="totpConfirmPasscode"/>
				</div>
			</div>
			<x-button @click="totpConfirm">{{ $t('misc.confirm') }}</x-button>
		</template>
		<template v-else-if="totp.secret !== '' && totp.enabled">
			<p>
				{{ $t('user.settings.totp.setupSuccess') }}
			</p>
			<p v-if="!totpDisableForm">
				<x-button @click="totpDisableForm = true" class="is-danger">{{ $t('misc.disable') }}</x-button>
			</p>
			<div v-if="totpDisableForm">
				<div class="field">
					<label class="label" for="currentPassword">{{ $t('user.settings.totp.enterPassword') }}</label>
					<div class="control">
						<input
							@keyup.enter="totpDisable"
							class="input"
							id="currentPassword"
							:placeholder="$t('user.settings.currentPasswordPlaceholder')"
							type="password"
							v-focus
							v-model="totpDisablePassword"/>
					</div>
				</div>
				<x-button @click="totpDisable" class="is-danger">
					{{ $t('user.settings.totp.disable') }}
				</x-button>
				<x-button @click="totpDisableForm = false" variant="tertiary" class="ml-2">
					{{ $t('misc.cancel') }}
				</x-button>
			</div>
		</template>
	</card>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
export default defineComponent({ name: 'user-settings-totp' })
</script>

<script lang="ts" setup>
import {computed, ref, shallowReactive} from 'vue'
import {useStore} from 'vuex'
import {useI18n} from 'vue-i18n'

import TotpService from '@/services/totp'
import TotpModel from '@/models/totp'

import {success} from '@/message'

import { useTitle } from '@/composables/useTitle'

const {t} = useI18n({useScope: 'global'})
useTitle(() => `${t('user.settings.totp.title')} - ${t('user.settings.title')}`)


const totpService = shallowReactive(new TotpService())
const totp = ref(new TotpModel())
const totpQR = ref('')
const totpEnrolled = ref(false)
const totpConfirmPasscode = ref('')
const totpDisableForm = ref(false)
const totpDisablePassword = ref('')

const store = useStore()
const totpEnabled = computed(() => store.state.config.totpEnabled)

totpStatus()

async function totpStatus() {
	if (!totpEnabled.value) {
		return
	}
	try {
		totp.value = await totpService.get()
		totpSetQrCode()
	} catch(e) {
		// Error code 1016 means totp is not enabled, we don't need an error in that case.
		if (e.response?.data?.code === 1016) {
			totpEnrolled.value = false
			return
		}

		throw e
	}
}

async function totpSetQrCode() {
	const qr = await totpService.qrcode()
	totpQR.value = window.URL.createObjectURL(qr)
}

async function totpEnroll() {
	totp.value = await totpService.enroll()
	totpEnrolled.value = true
	totpSetQrCode()
}

async function totpConfirm() {
	await totpService.enable({passcode: totpConfirmPasscode.value})
	totp.value.enabled = true
	success({message: t('user.settings.totp.confirmSuccess')})
}

async function totpDisable() {
	await totpService.disable({password: totpDisablePassword.value})
	totpEnrolled.value = false
	totp.value = new TotpModel()
	success({message: t('user.settings.totp.disableSuccess')})
}
</script>