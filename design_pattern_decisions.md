# Design Pattern Decissions

## Access Control Design Patterns (Ownable)
### SignMeUp.setPrice(uint)
SignMeUp.setPrice(uint) uses onlyOwner modifier. Changing the price is only permitted to contract owner.

## Inheritance and Interfaces
### SignMeUp is Ownable and ERC721
This contract extends from @openzeppelin/contracts/access/Ownable.sol and @openzeppelin/contracts/token/ERC721/ERC721.sol