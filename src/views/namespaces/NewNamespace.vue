<template>
	<create-edit
		:title="$t('namespace.create.title')"
		@create="newNamespace()"
		:primary-disabled="namespace.title === ''"
	>
		<div class="field">
			<label class="label" for="namespaceTitle">{{ $t('namespace.attributes.title') }}</label>
			<div
				class="control is-expanded"
				:class="{ 'is-loading': namespaceService.loading }"
			>
				<input
					@keyup.enter="newNamespace()"
					@keyup.esc="back()"
					class="input"
					:placeholder="$t('namespace.attributes.titlePlaceholder')"
					type="text"
					:class="{ disabled: namespaceService.loading }"
					v-focus
					v-model="namespace.title"
				/>
			</div>
		</div>
		<p class="help is-danger" v-if="showError && namespace.title === ''">
			{{ $t('namespace.create.titleRequired') }}
		</p>
		<div class="field">
			<label class="label">{{ $t('namespace.attributes.color') }}</label>
			<div class="control">
				<color-picker v-model="namespace.hexColor"/>
			</div>
		</div>

		<message class="mt-4">
			<h4 class="title">{{ $t('namespace.create.tooltip') }}</h4>

			{{ $t('namespace.create.explanation') }}
		</message>
	</create-edit>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

import Message from '@/components/misc/message'
import NamespaceModel from '../../models/namespace'
import NamespaceService from '../../services/namespace'
import CreateEdit from '@/components/misc/create-edit.vue'
import ColorPicker from '../../components/input/colorPicker'

export default defineComponent({
	name: 'NewNamespace',
	data() {
		return {
			showError: false,
			namespace: new NamespaceModel(),
			namespaceService: new NamespaceService(),
		}
	},
	components: {
		Message,
		ColorPicker,
		CreateEdit,
	},
	mounted() {
		this.setTitle(this.$t('namespace.create.title'))
	},
	methods: {
		async newNamespace() {
			if (this.namespace.title === '') {
				this.showError = true
				return
			}
			this.showError = false

			const namespace = await this.namespaceService.create(this.namespace)
			this.$store.commit('namespaces/addNamespace', namespace)
			this.$message.success({message: this.$t('namespace.create.success')})
			this.$router.back()
		},
	},
})
</script>
