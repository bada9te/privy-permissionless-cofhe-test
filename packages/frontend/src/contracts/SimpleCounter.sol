// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {FHE, euint64, InEuint64} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract SimpleCounter {
    address owner;

    euint64 counter;
    euint64 delta;
    euint64 lastDecryptedCounter;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can access that function");
        _;
    }

    constructor(uint64 initial_value, address intialOwner) {
        owner = intialOwner;
        counter = FHE.asEuint64(initial_value);
        FHE.allowGlobal(counter);

        // Encrypt the value 1 only once instead of every value change
        delta = FHE.asEuint64(1);
        FHE.allowGlobal(delta);
    }

    function increment_counter() external {
        counter = FHE.add(counter, delta);
        FHE.allowGlobal(counter);
    }

    function decrement_counter() external {
        counter = FHE.sub(counter, delta);
        FHE.allowGlobal(counter);
    }

    function reset_counter(InEuint64 calldata value) external {
        counter = FHE.asEuint64(value);
        FHE.allowGlobal(counter);
    }

    function decrypt_counter() external {
        lastDecryptedCounter = counter;
        FHE.decrypt(lastDecryptedCounter);
    }

    function get_counter_value() external view returns(uint256) {
        (uint256 value, bool decrypted) = FHE.getDecryptResultSafe(lastDecryptedCounter);
        if (!decrypted)
            revert("Value is not ready");

        return value;
    }

    function get_encrypted_counter_value() external view returns(euint64) {
        return counter;
    }

}