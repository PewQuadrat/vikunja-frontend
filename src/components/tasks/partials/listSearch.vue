<template>
	<multiselect
		class="control is-expanded"
		:placeholder="$t('list.search')"
		@search="findLists"
		:search-results="foundLists"
		@select="select"
		label="title"
		v-model="list"
		:select-placeholder="$t('list.searchSelect')"
	>
		<template #searchResult="props">
			<span class="list-namespace-title search-result">{{ namespace(props.option.namespaceId) }} ></span>
			{{ props.option.title }}
		</template>
	</multiselect>
</template>

<script lang="ts" setup>
import {reactive, ref, watch} from 'vue'
import type {PropType} from 'vue'
import {useStore} from 'vuex'
import {useI18n} from 'vue-i18n'
import ListModel from '@/models/list'
import Multiselect from '@/components/input/multiselect.vue'

const props = defineProps({
	modelValue: {
		type: Object as PropType<ListModel>,
		validator(value) {
			return value instanceof ListModel
		},
		required: false,
	},
})
const emit = defineEmits(['update:modelValue'])

const store = useStore()
const {t} = useI18n({useScope: 'global'})

const list = reactive<ListModel>(new ListModel())

watch(
	() => props.modelValue,
	(newList) => Object.assign(list, newList),
	{
		immediate: true,
		deep: true,
	},
)

const foundLists = ref([])
function findLists(query: string) {
	if (query === '') {
		select(null)
	}
	foundLists.value = store.getters['lists/searchList'](query)
}

function select(l: ListModel | null) {
	Object.assign(list, l)
	emit('update:modelValue', list)
}

function namespace(namespaceId: number) {
	const namespace = store.getters['namespaces/getNamespaceById'](namespaceId)
	return namespace !== null
		? namespace.title
		: t('list.shared')
}
</script>

<style lang="scss" scoped>
.list-namespace-title {
	color: var(--grey-500);
}
</style>