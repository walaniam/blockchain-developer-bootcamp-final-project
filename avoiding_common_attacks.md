# Avoid Common Attacks

## Using Specific Compiler Pragma
SignMeUp.sol, Migrations.sol and truffe-config.js have all 0.8.10 pragma version. See [SWC-103](https://swcregistry.io/docs/SWC-103)

## TxOrigin Attack
All permission modifiers in SignMeUp contract use msg.sender to authenticate and authorize the caller. See [SWC-115](https://swcregistry.io/docs/SWC-115)

## Use Modifiers Only for Validation
All modifiers only validate the parameters without making any side effects.

## Proper Use of Require, Assert and Revert
- require used mostly in modifiers, prior to executing functions
- assert used for a case that should not actually happen

## Checks-Effects-Interactions
SignMeUp.createNewSignUpEventEntry transfer ether after making all required state changes.
