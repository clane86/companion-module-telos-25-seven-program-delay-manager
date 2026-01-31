import { combineRgb } from '@companion-module/base'

export const FEEDBACK_IDS = {
	DELAY_FULL: 'delay_full',
	BUILD_LAMP: 'build_lamp',
	EXIT_LAMP: 'exit_lamp',
	COUGH_LAMP: 'cough_lamp',
	BYPASS_ACTIVE: 'bypass_active',
}

const FEEDBACK_VARIABLES = {
	[FEEDBACK_IDS.DELAY_FULL]: 'delayfull',
	[FEEDBACK_IDS.BUILD_LAMP]: 'buildlamp',
	[FEEDBACK_IDS.EXIT_LAMP]: 'exitlamp',
	[FEEDBACK_IDS.COUGH_LAMP]: 'coughlamp',
	[FEEDBACK_IDS.BYPASS_ACTIVE]: 'bypass',
}

function isVariableActive(self, variableId) {
	if (typeof self.getVariableValue === 'function') {
		return self.getVariableValue(variableId) === '1'
	}
	return self.variableValues?.[variableId] === '1'
}

export function getFeedbackDefinitions(self) {
	return {
		[FEEDBACK_IDS.DELAY_FULL]: {
			name: 'Delay Full',
			type: 'boolean',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: () => isVariableActive(self, FEEDBACK_VARIABLES[FEEDBACK_IDS.DELAY_FULL]),
		},
		[FEEDBACK_IDS.BUILD_LAMP]: {
			name: 'Build Lamp',
			type: 'boolean',
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: () => isVariableActive(self, FEEDBACK_VARIABLES[FEEDBACK_IDS.BUILD_LAMP]),
		},
		[FEEDBACK_IDS.EXIT_LAMP]: {
			name: 'Exit Lamp',
			type: 'boolean',
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: () => isVariableActive(self, FEEDBACK_VARIABLES[FEEDBACK_IDS.EXIT_LAMP]),
		},
		[FEEDBACK_IDS.COUGH_LAMP]: {
			name: 'Cough Lamp',
			type: 'boolean',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 255),
			},
			callback: () => isVariableActive(self, FEEDBACK_VARIABLES[FEEDBACK_IDS.COUGH_LAMP]),
		},
		[FEEDBACK_IDS.BYPASS_ACTIVE]: {
			name: 'Bypass Active',
			type: 'boolean',
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 255),
			},
			callback: () => isVariableActive(self, FEEDBACK_VARIABLES[FEEDBACK_IDS.BYPASS_ACTIVE]),
		},
	}
}
