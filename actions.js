const ARGUMENT_CHOICES = [
	{ id: 'Build', label: 'Build' },
	{ id: 'Exit', label: 'Exit' },
	{ id: 'Cough', label: 'Cough' },
	{ id: 'Dump', label: 'Dump' },
	{ id: 'Bypass', label: 'Bypass' },
	{ id: 'Custom', label: 'Custom...' },
]

const VARIABLE_CHOICES = [
	{ id: 'Depth', label: 'Depth' },
	{ id: 'PeakInput', label: 'PeakInput' },
	{ id: 'PeakOutput', label: 'PeakOutput' },
	{ id: 'TemperatureC', label: 'TemperatureC' },
	{ id: 'TemperatureF', label: 'TemperatureF' },
	{ id: 'Custom', label: 'Custom...' },
]

function resolveChoiceValue(options, choiceKey, customKey) {
	if (options[choiceKey] === 'Custom') {
		return options[customKey]?.trim() || ''
	}
	return options[choiceKey]
}

function sendLine(self, line) {
	if (!line) return
	if (self.socket !== undefined && self.socket.isConnected) {
		const sendBuf = Buffer.from(`${line}\n`, 'utf8')
		self.log('debug', `sending to ${self.config.host}: ${line}`)
		self.socket.send(sendBuf)
	} else {
		self.log('debug', 'Socket not connected :(')
	}
}

function buildArgumentOptions() {
	return [
		{
			type: 'dropdown',
			id: 'argument',
			label: 'Argument',
			default: 'Build',
			choices: ARGUMENT_CHOICES,
		},
		{
			type: 'textinput',
			id: 'argument_custom',
			label: 'Custom Argument',
			default: '',
			useVariables: true,
			isVisible: (options) => options.argument === 'Custom',
		},
	]
}

export function getActionDefinitions(self) {
	return {
		down: {
			name: 'Down (press/start)',
			options: buildArgumentOptions(),
			callback: async (action, context) => {
				const arg = await context.parseVariablesInString(resolveChoiceValue(action.options, 'argument', 'argument_custom'))
				if (arg) sendLine(self, `down ${arg}`)
			},
		},
		up: {
			name: 'Up (release/end)',
			options: buildArgumentOptions(),
			callback: async (action, context) => {
				const arg = await context.parseVariablesInString(resolveChoiceValue(action.options, 'argument', 'argument_custom'))
				if (arg) sendLine(self, `up ${arg}`)
			},
		},
		trigger: {
			name: 'Trigger (momentary)',
			options: buildArgumentOptions(),
			callback: async (action, context) => {
				const arg = await context.parseVariablesInString(resolveChoiceValue(action.options, 'argument', 'argument_custom'))
				if (arg) sendLine(self, `trigger ${arg}`)
			},
		},
		get: {
			name: 'Get Variable',
			options: [
				{
					type: 'dropdown',
					id: 'variable',
					label: 'Variable',
					default: 'Depth',
					choices: VARIABLE_CHOICES,
				},
				{
					type: 'textinput',
					id: 'variable_custom',
					label: 'Custom Variable',
					default: '',
					useVariables: true,
					isVisible: (options) => options.variable === 'Custom',
				},
			],
			callback: async (action, context) => {
				const variable = await context.parseVariablesInString(resolveChoiceValue(action.options, 'variable', 'variable_custom'))
				if (variable) sendLine(self, `get ${variable}`)
			},
		},
		send_raw: {
			name: 'Send Raw Command',
			options: [
				{
					type: 'textinput',
					id: 'raw_command',
					label: 'Command',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				const line = await context.parseVariablesInString(action.options.raw_command)
				sendLine(self, line.trim())
			},
		},
	}
}
