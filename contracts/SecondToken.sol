pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SecondToken is ERC20 {
    constructor() ERC20("SecondToken", "SND") {
        _mint(msg.sender, 2000000);
    }
}
