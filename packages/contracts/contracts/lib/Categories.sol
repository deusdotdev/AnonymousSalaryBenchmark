/* SPDX-License-Identifier: MIT */
pragma solidity ^0.8.28;

/**
 * @notice Category bands for SalaryFHE (position, city, seniority). Each dimension is an opaque
 *         uint16 index defined by the frontend lists; counts must stay in sync with them. The
 *         category id is a keccak256 hash of the tuple, so there is no packing collision risk and
 *         no practical per-dimension cap.
 */
library Categories {
    uint16 internal constant POSITION_COUNT = 35;
    uint16 internal constant CITY_COUNT = 55;
    uint16 internal constant SENIORITY_COUNT = 6;

    uint256 internal constant MIN_PARTICIPANTS = 5;

    /**
     * @notice Hash position, city, and seniority into a collision-free category id.
     */
    function categoryId(
        uint16 positionId,
        uint16 cityId,
        uint16 seniorityId
    ) internal pure returns (uint256) {
        return uint256(keccak256(abi.encode(positionId, cityId, seniorityId)));
    }

    function validateCategory(
        uint16 positionId,
        uint16 cityId,
        uint16 seniorityId
    ) internal pure {
        if (positionId >= POSITION_COUNT) revert InvalidPosition();
        if (cityId >= CITY_COUNT) revert InvalidCity();
        if (seniorityId >= SENIORITY_COUNT) revert InvalidSeniority();
    }

    error InvalidPosition();
    error InvalidCity();
    error InvalidSeniority();
}
