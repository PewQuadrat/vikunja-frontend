<template>
	<div
		class="task loader-container draggable"
		:class="{
			'is-loading': loadingInternal || loading,
			'draggable': !(loadingInternal || loading),
			'has-light-text': color !== TASK_DEFAULT_COLOR && !colorIsDark(color),
		}"
		:style="{'background-color': color !== TASK_DEFAULT_COLOR ? color : false}"
		@click.exact="openTaskDetail()"
		@click.ctrl="() => toggleTaskDone(task)"
		@click.meta="() => toggleTaskDone(task)"
	>
		<span class="task-id">
			<Done class="kanban-card__done" :is-done="task.done" variant="small" />
			<template v-if="task.identifier === ''">
				#{{ task.index }}
			</template>
			<template v-else>
				{{ task.identifier }}
			</template>
		</span>
		<span
			:class="{'overdue': task.dueDate <= new Date() && !task.done}"
			class="due-date"
			v-if="task.dueDate > 0"
			v-tooltip="formatDate(task.dueDate)">
			<span class="icon">
				<icon :icon="['far', 'calendar-alt']"/>
			</span>
			<time :datetime="formatISO(task.dueDate)">
				{{ formatDateSince(task.dueDate) }}
			</time>
		</span>
		<h3>{{ task.title }}</h3>
		<progress
			class="progress is-small"
			v-if="task.percentDone > 0"
			:value="task.percentDone * 100" max="100">
			{{ task.percentDone * 100 }}%
		</progress>
		<div class="footer">
			<labels :labels="task.labels"/>
			<priority-label :priority="task.priority" :done="task.done"/>
			<div class="assignees" v-if="task.assignees.length > 0">
				<user
					:avatar-size="24"
					:key="task.id + 'assignee' + u.id"
					:show-username="false"
					:user="u"
					v-for="u in task.assignees"
				/>
			</div>
			<checklist-summary :task="task"/>
			<span class="icon" v-if="task.attachments.length > 0">
				<icon icon="paperclip"/>	
			</span>
			<span v-if="task.description" class="icon">
				<icon icon="align-left"/>
			</span>
			<span class="icon" v-if="task.repeatAfter.amount > 0">
				<icon icon="history"/>
			</span>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

import {playPop} from '../../../helpers/playPop'
import PriorityLabel from '../../../components/tasks/partials/priorityLabel'
import User from '../../../components/misc/user'
import Done from '@/components/misc/Done.vue'
import Labels from '../../../components/tasks/partials/labels'
import ChecklistSummary from './checklist-summary'
import {TASK_DEFAULT_COLOR} from '@/models/task'

import {colorIsDark} from '@/helpers/color/colorIsDark'

export default defineComponent({
	name: 'kanban-card',
	components: {
		ChecklistSummary,
		Done,
		PriorityLabel,
		User,
		Labels,
	},
	data() {
		return {
			loadingInternal: false,
			TASK_DEFAULT_COLOR,
		}
	},
	props: {
		task: {
			required: true,
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	computed: {
		color() {
			return this.task.getHexColor
				? this.task.getHexColor() 
				: TASK_DEFAULT_COLOR
		},
	},
	methods: {
		colorIsDark,
		async toggleTaskDone(task) {
			this.loadingInternal = true
			try {
				const done = !task.done
				await this.$store.dispatch('tasks/update', {
					...task,
					done,
				})
				if (done) {
					playPop()
				}
			} finally {
				this.loadingInternal = false
			}
		},
		openTaskDetail() {
			this.$router.push({
				name: 'task.detail',
				params: { id: this.task.id },
				state: { backdropView: this.$router.currentRoute.value.fullPath },
			})
		},
	},
})
</script>

<style lang="scss" scoped>
$task-background: var(--white);

.task {
	-webkit-touch-callout: none; // iOS Safari
	user-select: none;
	cursor: pointer;
	box-shadow: var(--shadow-xs);
	display: block;
	border: 3px solid transparent;

	font-size: .9rem;
	padding: .4rem;
	border-radius: $radius;
	background: $task-background;

	&.loader-container.is-loading::after {
		width: 1.5rem;
		height: 1.5rem;
		top: calc(50% - .75rem);
		left: calc(50% - .75rem);
		border-width: 2px;
	}

	h3 {
		font-family: $family-sans-serif;
		font-size: .85rem;
		word-break: break-word;
	}

	.progress {
		margin: 8px 0 0 0;
		width: 100%;
		height: 0.5rem;
	}

	.due-date {
		float: right;
		display: flex;
		align-items: center;

		.icon {
			margin-right: .25rem;
		}

		&.overdue {
			color: var(--danger);
		}
	}

	.label-wrapper .tag {
		margin: .5rem .5rem 0 0;
	}

	.footer {
		background: transparent;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;

		:deep(.tag),
		.assignees,
		.icon,
		.priority-label {
			margin-top: .25rem;
			margin-right: .25rem;
		}

		.assignees {
			display: flex;

			.user {
				display: inline;
				margin: 0;

				img {
					margin: 0;
				}
			}
		}

		// FIXME: should be in labels.vue
		:deep(.tag) {
			margin-left: 0;
		}

		.priority-label {
			font-size: .75rem;
			height: 2rem;

			.icon {
				height: 1rem;
				padding: 0 .25rem;
				margin-top: 0;
			}
		}
	}

	.footer .icon,
	.due-date,
	.priority-label {
		background: var(--grey-100);
		border-radius: $radius;
		padding: 0 .5rem;
	}

	.due-date {
		padding: 0 .25rem;
	}

	.task-id {
		color: var(--grey-500);
		font-size: .8rem;
		margin-bottom: .25rem;
		display: flex;
	}

	&.is-moving {
		opacity: .5;
	}

	span {
		width: auto;
	}

	&.has-light-text {
		color: var(--white);

		.task-id {
			color: var(--grey-200);
		}

		.footer .icon,
		.due-date,
		.priority-label {
			background: var(--grey-800);
		}

		.footer {
			.icon svg {
				fill: var(--white);
			}
		}
	}
}

.kanban-card__done {
	margin-right: .25rem;
}
</style>