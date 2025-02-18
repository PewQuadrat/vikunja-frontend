<template>
	<ready>
		<template v-if="authUser">
			<TheNavigation/>
			<content-auth/>
		</template>
		<content-link-share v-else-if="authLinkShare"/>
		<no-auth-wrapper v-else>
			<router-view/>
		</no-auth-wrapper>
		<Notification/>

		<transition name="fade">
			<keyboard-shortcuts v-if="keyboardShortcutsActive"/>
		</transition>
	</ready>
</template>

<script lang="ts" setup>
import {computed, watch, Ref} from 'vue'
import {useRouter} from 'vue-router'
import {useRouteQuery} from '@vueuse/router'
import {useStore} from 'vuex'
import {useI18n} from 'vue-i18n'
import isTouchDevice from 'is-touch-device'
import {success} from '@/message'

import Notification from '@/components/misc/notification.vue'
import KeyboardShortcuts from './components/misc/keyboard-shortcuts/index.vue'
import TheNavigation from '@/components/home/TheNavigation.vue'
import ContentAuth from './components/home/contentAuth.vue'
import ContentLinkShare from './components/home/contentLinkShare.vue'
import NoAuthWrapper from '@/components/misc/no-auth-wrapper.vue'
import Ready from '@/components/misc/ready.vue'

import {setLanguage} from './i18n'
import AccountDeleteService from '@/services/accountDelete'

import {useColorScheme} from '@/composables/useColorScheme'
import {useBodyClass} from '@/composables/useBodyClass'

const store = useStore()
const router = useRouter()

useBodyClass('is-touch', isTouchDevice())
const keyboardShortcutsActive = computed(() => store.state.keyboardShortcutsActive)

const authUser = computed(() => store.getters['auth/authUser'])
const authLinkShare = computed(() => store.getters['auth/authLinkShare'])

const {t} = useI18n({useScope: 'global'})

// setup account deletion verification
const accountDeletionConfirm = useRouteQuery('accountDeletionConfirm') as Ref<null | string>
watch(accountDeletionConfirm, async (accountDeletionConfirm) => {
	if (accountDeletionConfirm === null) {
		return
	}

	const accountDeletionService = new AccountDeleteService()
	await accountDeletionService.confirm(accountDeletionConfirm)
	success({message: t('user.deletion.confirmSuccess')})
	store.dispatch('auth/refreshUserInfo')
}, { immediate: true })

// setup password reset redirect
const userPasswordReset = useRouteQuery('userPasswordReset') as Ref<null | string>
watch(userPasswordReset, (userPasswordReset) => {
	if (userPasswordReset === null) {
		return
	}

	localStorage.setItem('passwordResetToken', userPasswordReset)
	router.push({name: 'user.password-reset.reset'})
}, { immediate: true })

// setup email verification redirect
const userEmailConfirm = useRouteQuery('userEmailConfirm') as Ref<null | string>
watch(userEmailConfirm, (userEmailConfirm) => {
	if (userEmailConfirm === null) {
		return
	}

	localStorage.setItem('emailConfirmToken', userEmailConfirm)
	router.push({name: 'user.login'})
}, { immediate: true })

setLanguage()
useColorScheme()
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
