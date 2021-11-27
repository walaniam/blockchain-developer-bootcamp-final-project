# Design Pattern Decissions

## Access Control Design Patterns (Ownable)
This contract extends from @openzeppelin/contracts/access/Ownable.sol. The ```onlyOwner``` modifier is used by SignMeUp.setPrice(uint) function to make sure that changing the price is only permitted to contract owner.

## Inheritance and Interfaces
### SignMeUp is Ownable and ERC721
This contract extends from ```@openzeppelin/contracts/access/Ownable.sol``` and ```@openzeppelin/contracts/token/ERC721/ERC721.sol```. ERC721 is used to mint a token for a user that has been selected for organized event.