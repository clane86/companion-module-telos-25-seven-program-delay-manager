# companion-module-telos-25-seven-program-delay-manager

Companion module for the **Telos 25-Seven PDM / PDM II Broadcast Delay** using the Serial Remote Control protocol over TCP.

For the easiest implementation, the preset buttons in this module are designed to mimic the front panel buttons of the PDM unit.

For more advanced use, you can use the *Send Raw Command* action and refer to the *last_response* variable for a more custom approach. Refer to the PDM manual on the Telos website for exact commands (careful, they're case-sensitive!)

**WARNING:** disabling any reporting via raw command can negatively affect feedbacks and variables!

## Configuration

- **Host**: PDM or PDM II IP/hostname
- **Port**: 5443 (default)
- **Delay Poll Interval**: Milliseconds between polling the delay time (polls only when DelayFull=0)

## Notes

- The module enables all event reporting automatically on connect.
- Delay polling uses `get Depth` from the protocol.

## Operational Disclaimer

This module is provided as-is. Use at your own risk. In broadcast airchains,
test thoroughly and ensure appropriate safeguards. The authors are not
responsible for on-air content or operational impact.

## Install

Download **PDM-Companion-Module-v1.0.0.tgz** from the Assets section of this release and import it into Bitfocus Companion using the *Import module package* button in the modules section on the left pane.

## Version History

| Version  | Notes                                           |
| -------- | ----------------------------------------------- |
| **1.0.0** | Initial PDM/PDM II TCP control and variables   |
