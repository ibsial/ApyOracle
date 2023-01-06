// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
contract Float is Ownable {
    mapping(address => PositionData) public position;

    struct PositionData {
        uint32 slot; // array number
        uint32 fraction; // first byte in the slot
    }

    mapping(uint128 => bytes32) public values;
    
    constructor() {
        _transferOwnership(_msgSender());
    }

    function _addNumber(uint32 _slot, bytes32 _preparedNumber) internal {
        values[_slot] = _preparedNumber;
    }
    function addNumber(uint32 _slot, bytes32 _preparedNumber) external onlyOwner {
        _addNumber(_slot, _preparedNumber);
    }

    function addNumbers(
        uint32[] memory _slots,
        bytes32[] memory _preparedNumbers
    ) external onlyOwner {
        require(
            _slots.length == _preparedNumbers.length,
            "arrays length mismatch"
        );
        for (uint i = 0; i < _slots.length; i++) {
            _addNumber(_slots[i], _preparedNumbers[i]);
        }
    }
    function _addToken(address _token, PositionData memory _position) internal {
        position[_token] = _position;
    }
    function addToken(address _token, PositionData memory _position) external onlyOwner {
        _addToken(_token, _position);
    }

    function addTokens(
        address[] memory _token,
        PositionData[] memory _position
    ) external onlyOwner {
        for (uint i = 0; i < _token.length; i++) {
            _addToken(_token[i], _position[i]);
        }
    }
    //// is there a reason to make it private?
    function _getValue(
        uint128 _slot,
        uint _firstBytePos
    ) public view returns (bytes32) {
        return (values[_slot] << (_firstBytePos * 8)) >> 240;
    }

    //// is there a reason to make it private?

    // decode hex number to uint256
    // consider mantissa taking first 2 bits
    function _decodeValue(bytes32 _value) public pure returns (uint256) {
        uint256 mantissa = uint256(_value) >> 14;
        uint256 body = (uint256(_value) << 242) >> 242;
        return body * (10 ** (3 - mantissa));
    }

    // look at an example
    // having bits 10_10011101110101 (2 and 10101 in dec)
    // we mean a float number 101.01
    // these bits are converted to a hex number
    // A775
    function getValueForToken(address _token) public view returns (uint256) {
        PositionData memory pos = position[_token];
        bytes32 value = _getValue(pos.slot, pos.fraction);
        return _decodeValue(value);
    }

    // function getValuesForTokens ??
}
