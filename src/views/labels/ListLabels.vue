<template>
	<div :class="{ 'is-loading': loading}" class="loader-container">
		<x-button
			:to="{name:'labels.create'}"
			class="is-pulled-right"
			icon="plus"
		>
			{{ $t('label.create.header') }}
		</x-button>

		<div class="content">
			<h1>{{ $t('label.manage') }}</h1>
			<p v-if="Object.entries(labels).length > 0">
				{{ $t('label.description') }}
			</p>
			<p v-else class="has-text-centered has-text-grey is-italic">
				{{ $t('label.newCTA') }}
				<router-link :to="{name:'labels.create'}">{{ $t('label.create.title') }}.</router-link>
			</p>
		</div>

		<div class="columns">
			<div class="labels-list column">
				<span
					:class="{'disabled': userInfo.id !== l.createdBy.id}" :key="l.id"
					:style="{'background': l.hexColor, 'color': l.textColor}"
					class="tag"
					v-for="l in labels"
				>
					<span
						v-if="userInfo.id !== l.createdBy.id"
						v-tooltip.bottom="$t('label.edit.forbidden')">
						{{ l.title }}
					</span>
					<BaseButton
						:style="{'color': l.textColor}"
						@click="editLabel(l)"
						v-else>
						{{ l.title }}
					</BaseButton>
					<BaseButton @click="showDeleteDialoge(l)" class="delete is-small" v-if="userInfo.id === l.createdBy.id" />
				</span>
			</div>
			<div class="column is-4" v-if="isLabelEdit">
				<card :title="$t('label.edit.header')" :has-close="true" @close="() => isLabelEdit = false">
					<form @submit.prevent="editLabelSubmit()">
						<div class="field">
							<label class="label">{{ $t('label.attributes.title') }}</label>
							<div class="control">
								<input
									class="input"
									:placeholder="$t('label.attributes.titlePlaceholder')"
									type="text"
									v-model="labelEditLabel.title"/>
							</div>
						</div>
						<div class="field">
							<label class="label">{{ $t('label.attributes.description') }}</label>
							<div class="control">
								<editor
									:preview-is-default="false"
									:placeholder="$t('label.attributes.description')"
									v-if="editorActive"
									v-model="labelEditLabel.description"
								/>
							</div>
						</div>
						<div class="field">
							<label class="label">{{ $t('label.attributes.color') }}</label>
							<div class="control">
								<color-picker v-model="labelEditLabel.hexColor"/>
							</div>
						</div>
						<div class="field has-addons">
							<div class="control is-expanded">
								<x-button
									:loading="loading"
									class="is-fullwidth"
									@click="editLabelSubmit()"
								>
									{{ $t('misc.save') }}
								</x-button>
							</div>
							<div class="control">
								<x-button
									@click="showDeleteDialoge(labelEditLabel)"
									icon="trash-alt"
									class="is-danger"
								/>
							</div>
						</div>
					</form>
				</card>
			</div>

			<modal
				@close="showDeleteModal = false"
				@submit="deleteLabel(labelToDelete)"
				v-if="showDeleteModal"
			>
				<template #header><span>{{ $t('task.label.delete.header') }}</span></template>

				<template #text>
					<p>{{ $t('task.label.delete.text1') }}<br/>
						{{ $t('task.label.delete.text2') }}</p>
				</template>
			</modal>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {mapState} from 'vuex'

import LabelModel from '../../models/label'
import {LOADING, LOADING_MODULE} from '@/store/mutation-types'

import BaseButton from '@/components/base/BaseButton.vue'
import AsyncEditor from '@/components/input/AsyncEditor'
import ColorPicker from '@/components/input/colorPicker'

export default defineComponent({
	name: 'ListLabels',
	components: {
		BaseButton,
		ColorPicker,
		editor: AsyncEditor,
	},
	data() {
		return {
			labelEditLabel: new LabelModel(),
			isLabelEdit: false,
			editorActive: false,
			showDeleteModal: false,
			labelToDelete: null,
		}
	},
	created() {
		this.$store.dispatch('labels/loadAllLabels')
	},
	mounted() {
		this.setTitle(this.$t('label.title'))
	},
	computed: mapState({
		userInfo: state => state.auth.info,
		// Alphabetically sort the labels
		labels: state => Object.values(state.labels.labels).sort((f, s) => f.title > s.title ? 1 : -1),
		loading: state => state[LOADING] && state[LOADING_MODULE] === 'labels',
	}),
	methods: {
		deleteLabel(label) {
			this.showDeleteModal = false
			this.isLabelEdit = false
			return this.$store.dispatch('labels/deleteLabel', label)
		},
		editLabelSubmit() {
			return this.$store.dispatch('labels/updateLabel', this.labelEditLabel)
		},
		editLabel(label) {
			if (label.createdBy.id !== this.userInfo.id) {
				return
			}
			// Duplicating the label to make sure it does not look like changes take effect immediatly as the label 
			// object passed to this function here still has a reference to the store.
			this.labelEditLabel = new LabelModel({
				...label,
				// The model does not support passing dates into it directly so we need to convert them first				
				created: +label.created,
				updated: +label.updated,
			})
			this.isLabelEdit = true

			// This makes the editor trigger its mounted function again which makes it forget every input
			// it currently has in its textarea. This is a counter-hack to a hack inside of vue-easymde
			// which made it impossible to detect change from the outside. Therefore the component would
			// not update if new content from the outside was made available.
			// See https://github.com/NikulinIlya/vue-easymde/issues/3
			this.editorActive = false
			this.$nextTick(() => this.editorActive = true)
		},
		showDeleteDialoge(label) {
			this.labelToDelete = label
			this.showDeleteModal = true
		},
	},
})
</script>
