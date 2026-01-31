import { InstanceBase, InstanceStatus, runEntrypoint, TCPHelper } from '@companion-module/base'
import { ConfigFields } from './config.js'
import { getActionDefinitions } from './actions.js'
import { FEEDBACK_IDS, getFeedbackDefinitions } from './feedbacks.js'
import { getPresetDefinitions } from './presets.js'

const EVENT_VARIABLES = {
	Building: 'building',
	BuildTrig: 'buildtrig',
	Bypass: 'bypass',
	DelayEmpty: 'delayempty',
	DelayFull: 'delayfull',
	DelaySafe: 'delaysafe',
	DelayUnsafe: 'delayunsafe',
	DumpTrig: 'dumptrig',
	EmptyTrig: 'emptytrig',
	Exiting: 'exiting',
	FullTrig: 'fulltrig',
	Muted: 'muted',
	BuildLamp: 'buildlamp',
	ExitLamp: 'exitlamp',
	DumpLamp: 'dumplamp',
	CoughLamp: 'coughlamp',
}

const FEEDBACK_EVENT_MAP = {
	DelayFull: [FEEDBACK_IDS.DELAY_FULL],
	BuildLamp: [FEEDBACK_IDS.BUILD_LAMP],
	ExitLamp: [FEEDBACK_IDS.EXIT_LAMP],
	CoughLamp: [FEEDBACK_IDS.COUGH_LAMP],
	Bypass: [FEEDBACK_IDS.BYPASS_ACTIVE],
}

class PdmIiInstance extends InstanceBase {
	async init(config) {
		this.config = config
		this.receiveBuffer = ''
		this.eventStates = {}
		this.variableValues = {}
		this.pollTimer = undefined

		this.setActionDefinitions(getActionDefinitions(this))
		this.setFeedbackDefinitions(getFeedbackDefinitions(this))
		this.setPresetDefinitions(getPresetDefinitions())
		this.initVariables()

		await this.configUpdated(config)
	}

	async configUpdated(config) {
		if (this.socket) {
			this.socket.destroy()
			delete this.socket
		}

		this.config = config

		this.init_tcp()
		this.startPolling()
	}

	async destroy() {
		this.stopPolling()
		if (this.socket) {
			this.socket.destroy()
		} else {
			this.updateStatus(InstanceStatus.Disconnected)
		}
	}

	// Return config fields for web config
	getConfigFields() {
		return ConfigFields
	}

	init_tcp() {
		if (this.socket) {
			this.socket.destroy()
			delete this.socket
		}

		this.updateStatus(InstanceStatus.Connecting)

		if (this.config.host && this.config.port) {
			this.socket = new TCPHelper(this.config.host, this.config.port)
			this.receiveBuffer = ''

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
				if (status === InstanceStatus.Ok) {
					this.enableAllEvents()
					this.sendCommand('get Depth')
				}
			})

			this.socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('data', (data) => {
				this.receiveBuffer += data.toString('utf8')
				this.processReceiveBuffer()
			})
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	initVariables() {
		const variableDefinitions = [
			{ name: 'Depth (seconds)', variableId: 'depth' },
			{ name: 'Peak Input (dBFS)', variableId: 'peak_input' },
			{ name: 'Peak Output (dBFS)', variableId: 'peak_output' },
			{ name: 'Temperature (C)', variableId: 'temperature_c' },
			{ name: 'Temperature (F)', variableId: 'temperature_f' },
			{ name: 'Last Response', variableId: 'last_response' },
			{ name: 'Last Event', variableId: 'last_event' },
			{ name: 'Last Event Value', variableId: 'last_event_value' },
		]

		for (const [eventName, variableId] of Object.entries(EVENT_VARIABLES)) {
			variableDefinitions.push({ name: `Event ${eventName}`, variableId })
		}

		this.setVariableDefinitions(variableDefinitions)
		this.resetVariables()
	}

	resetVariables() {
		this.eventStates = {}
		this.variableValues = {}
		const values = {
			depth: '',
			peak_input: '',
			peak_output: '',
			temperature_c: '',
			temperature_f: '',
			last_response: '',
			last_event: '',
			last_event_value: '',
		}

		for (const variableId of Object.values(EVENT_VARIABLES)) {
			values[variableId] = ''
		}

		this.applyVariableValues(values)
	}

	enableAllEvents() {
		this.sendCommand('enable All')
	}

	sendCommand(line) {
		if (!line) return
		if (this.socket !== undefined && this.socket.isConnected) {
			const sendBuf = Buffer.from(`${line}\n`, 'utf8')
			this.log('debug', `sending to ${this.config.host}: ${line}`)
			this.socket.send(sendBuf)
		}
	}

	getEventState(name) {
		return this.eventStates[name] ?? ''
	}

	getVariableValue(variableId) {
		return this.variableValues?.[variableId] ?? ''
	}

	startPolling() {
		this.stopPolling()
		const intervalMs = Number(this.config.poll_interval)
		if (!intervalMs || intervalMs <= 0) return
		this.pollTimer = setInterval(() => {
			if (!this.socket || !this.socket.isConnected) return
			if (this.getVariableValue('delayfull') === '1') return
			this.sendCommand('get Depth')
		}, intervalMs)
	}

	stopPolling() {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = undefined
		}
	}

	processReceiveBuffer() {
		const parts = this.receiveBuffer.split('\n')
		this.receiveBuffer = parts.pop() ?? ''
		for (const part of parts) {
			const line = part.replace(/\r/g, '').trimEnd()
			if (line.length > 0) {
				this.handleLine(line)
			}
		}
	}

	handleLine(line) {
		this.applyVariableValues({ last_response: line })
		if (this.config.debug_logging) {
			this.log('info', `PDM RX: ${line}`)
		}

		if (line.startsWith('@')) {
			this.handleEventLine(line.slice(1).trim())
			return
		}

		if (line.startsWith('!')) {
			this.handleResultLine(line.slice(1).trim())
		}
	}

	handleEventLine(payload) {
		const normalized = payload.replace(/[,\s]+$/g, '').trim()
		const parts = normalized.split('=')
		const eventName = parts[0]?.trim()
		if (!eventName) {
			this.applyVariableValues({ last_event: payload, last_event_value: '' })
			return
		}

		const eventValue = (parts[1] ?? '1').trim()
		const variableId = EVENT_VARIABLES[eventName]

		this.eventStates[eventName] = eventValue

		const updates = {
			last_event: eventName,
			last_event_value: eventValue,
		}

		if (variableId) {
			updates[variableId] = eventValue
		}

		this.applyVariableValues(updates)

		const feedbackIds = FEEDBACK_EVENT_MAP[eventName]
		if (feedbackIds) {
			this.checkFeedbacks(feedbackIds)
		} else {
			this.checkFeedbacks(Object.values(FEEDBACK_IDS))
		}
	}

	handleResultLine(payload) {
		const match = payload.match(/^(Depth|PeakInput|PeakOutput|TemperatureC|TemperatureF)\s*(?:=|:|-)?\s*([+-]?\d+(?:\.\d+)?)/)
		if (!match) return

		const name = match[1]
		const value = match[2]

		const updates = {}
		if (name === 'Depth') updates.depth = value
		if (name === 'PeakInput') updates.peak_input = value
		if (name === 'PeakOutput') updates.peak_output = value
		if (name === 'TemperatureC') updates.temperature_c = value
		if (name === 'TemperatureF') updates.temperature_f = value

		if (Object.keys(updates).length > 0) {
			this.applyVariableValues(updates)
		}
	}

	applyVariableValues(values) {
		this.variableValues = { ...this.variableValues, ...values }
		this.setVariableValues(values)
		this.checkFeedbacks()
	}
}

runEntrypoint(PdmIiInstance, [])
