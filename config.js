import { Regex } from '@companion-module/base'

const REGEX_IP_OR_HOST =
	'/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})$|^((([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]))$/'

export const ConfigFields = [
	{
		type: 'static-text',
		id: 'info',
		label: 'Information',
		width: 12,
		value: `
				<div class="alert alert-info">
					<h3>PDM / PDM II Serial Remote Control</h3>
					<div>
						This module connects to the PDM or PDM II Broadcast Delay over TCP.
					</div>
				</div>
			`,
	},
	{
		type: 'textinput',
		id: 'host',
		label: 'PDM/PDM II Host name or IP',
		width: 8,
		regex: REGEX_IP_OR_HOST,
	},
	{
		type: 'textinput',
		id: 'port',
		label: 'PDM/PDM II TCP Port',
		width: 4,
		default: 5443,
		regex: Regex.PORT,
	},
	{
		type: 'textinput',
		id: 'poll_interval',
		label: 'Delay Poll Interval (ms)',
		width: 4,
		default: 1000,
		regex: Regex.NUMBER,
	},
	{
		type: 'checkbox',
		id: 'debug_logging',
		label: 'Enable Debug Logging',
		default: false,
	},
]
