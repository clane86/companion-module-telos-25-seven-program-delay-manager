import { combineRgb } from '@companion-module/base'
import { FEEDBACK_IDS } from './feedbacks.js'

function makeTriggerPreset(name, argument, feedbackIds, inactiveBgcolor, feedbackStyle) {
	return {
		type: 'button',
		category: 'Controls',
		name,
		style: {
			text: name,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: inactiveBgcolor,
		},
		steps: [
			{
				down: [
					{
						actionId: 'trigger',
						options: {
							argument,
							argument_custom: '',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: feedbackIds.map((feedbackId) => ({
			feedbackId,
			options: {},
			style: feedbackStyle ?? {},
		})),
	}
}

function makeHoldPreset(name, argument, feedbackIds, inactiveBgcolor, feedbackStyle) {
	return {
		type: 'button',
		category: 'Controls',
		name,
		style: {
			text: name,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: inactiveBgcolor,
		},
		steps: [
			{
				down: [
					{
						actionId: 'down',
						options: {
							argument,
							argument_custom: '',
						},
					},
				],
				up: [
					{
						actionId: 'up',
						options: {
							argument,
							argument_custom: '',
						},
					},
				],
			},
		],
		feedbacks: feedbackIds.map((feedbackId) => ({
			feedbackId,
			options: {},
			style: feedbackStyle ?? {},
		})),
	}
}

export function getPresetDefinitions() {
	return [
		makeTriggerPreset('DUMP', 'Dump', [FEEDBACK_IDS.DELAY_FULL], combineRgb(16, 0, 0), {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		}),
		makeTriggerPreset('BUILD', 'Build', [FEEDBACK_IDS.BUILD_LAMP], combineRgb(0, 16, 0), {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(0, 255, 0),
		}),
		makeTriggerPreset('EXIT', 'Exit', [FEEDBACK_IDS.EXIT_LAMP], combineRgb(16, 16, 0), {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 255, 0),
		}),
		makeHoldPreset('COUGH', 'Cough', [FEEDBACK_IDS.COUGH_LAMP], combineRgb(0, 0, 16), {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 255),
		}),
		makeTriggerPreset('BYPASS', 'Bypass', [FEEDBACK_IDS.BYPASS_ACTIVE], combineRgb(16, 16, 16), {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 255, 255),
		}),
		{
			type: 'button',
			category: 'Status',
			name: 'Delay Display',
			style: {
				text: 'Delay\\n$(pdm:depth)',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
	]
}
