# Design Pattern Decissions

## Access Control Design Patterns (Ownable)
### SignMeUp.setPrice(uint)
SignMeUp.setPrice(uint) uses onlyOwner modifier. Changing the price is only permitted to contract owner.

## Inheritance and Interfaces
### SignMeUp is Ownable
This contract extends @openzeppelin/contracts/access/Ownable.sol contract.